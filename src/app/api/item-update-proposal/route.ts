import {
  canonicalizeContent,
  changedContentFields,
  contentHash,
  type ItemRefreshContent,
} from "@/lib/item-refresh";
import { currentRole, currentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { sanityClient } from "@/sanity/lib/client";
import { UserRole } from "@/types/user-role";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

type Proposal = {
  _id: string;
  status: string;
  baseItemUpdatedAt?: string;
  baseContentHash?: string;
  proposedContent?: ItemRefreshContent;
  item?: { _ref?: string };
};

type Item = ItemRefreshContent & {
  _id: string;
  _updatedAt: string;
  slug?: string;
};

const client = sanityClient.withConfig({ useCdn: false });

const isSameOriginStudioRequest = (request: Request) => {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3300",
  ].filter(Boolean);

  const allowedOrigin = allowedOrigins.some((allowed) => origin === allowed);
  if (!allowedOrigin || !referer) return false;

  try {
    return new URL(referer).pathname.startsWith("/studio");
  } catch {
    return false;
  }
};

const getProposal = (proposalId: string) =>
  client.fetch<Proposal | null>(
    `*[_type == "itemUpdateProposal" && _id == $proposalId][0]{
      _id,
      status,
      baseItemUpdatedAt,
      baseContentHash,
      proposedContent,
      item
    }`,
    { proposalId },
  );

const getItem = (itemId: string) =>
  client.fetch<Item | null>(
    `*[_type == "item" && _id == $itemId][0]{
      _id,
      _updatedAt,
      "slug": slug.current,
      name,
      link,
      description,
      introduction,
      "categories": categories[]->name,
      "tags": tags[]->name,
      "imageUrl": image.asset->url,
      "iconUrl": icon.asset->url
    }`,
    { itemId },
  );

const markProposal = async (
  proposalId: string,
  status: "rejected" | "stale",
  reviewNote: string,
  reviewer: string,
) => {
  await client
    .patch(proposalId)
    .set({
      status,
      reviewNote,
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewer,
    })
    .commit();
};

const uploadImageFromUrl = async (url: string, filename: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Asset fetch failed: HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return client.assets.upload("image", buffer, { filename });
};

const resolveReferences = async (
  names: string[],
  type: "category" | "tag",
  itemId: string,
) => {
  const documents = await client.fetch<{ _id: string; name: string }[]>(
    `*[_type == $type && name in $names]{_id, name}`,
    { type, names },
  );
  const byName = new Map(documents.map((document) => [document.name, document]));
  const missing = names.filter((name) => !byName.has(name));
  if (missing.length) {
    throw new Error(
      `Cannot apply proposal for ${itemId}; missing ${type}: ${missing.join(", ")}`,
    );
  }
  return names.map((name, index) => ({
    _type: "reference",
    _ref: byName.get(name)?._id,
    _key: `${type}-${index}`,
  }));
};

const ensureLinkAndSlugAvailable = async ({
  itemId,
  link,
  slug,
}: {
  itemId: string;
  link: string;
  slug: string;
}) => {
  const conflict = await client.fetch<{ link?: string; slug?: string } | null>(
    `*[_type == "item" && _id != $itemId && (link == $link || slug.current == $slug)][0]{
      link,
      "slug": slug.current
    }`,
    { itemId, link, slug },
  );
  if (conflict) {
    throw new Error(
      `Link or slug conflicts with another item (${conflict.link || conflict.slug})`,
    );
  }
};

export async function POST(request: Request) {
  try {
    const role = await currentRole();
    if (role !== UserRole.ADMIN && !isSameOriginStudioRequest(request)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const user = await currentUser();
    const reviewer = user?.email || user?.id || "admin";
    const body = (await request.json()) as {
      proposalId?: string;
      action?: "accept" | "reject";
      reviewNote?: string;
    };

    if (!body.proposalId || !body.action) {
      return NextResponse.json(
        { message: "proposalId and action are required" },
        { status: 400 },
      );
    }

    const proposal = await getProposal(body.proposalId);
    const itemId = proposal?.item?._ref;
    if (!proposal || !itemId) {
      return NextResponse.json({ message: "Proposal not found" }, { status: 404 });
    }
    if (proposal.status !== "pending") {
      return NextResponse.json(
        { message: `Proposal is already ${proposal.status}` },
        { status: 409 },
      );
    }

    if (body.action === "reject") {
      await markProposal(
        proposal._id,
        "rejected",
        body.reviewNote || "Rejected by reviewer",
        reviewer,
      );
      return NextResponse.json({ message: "Proposal rejected" });
    }

    const item = await getItem(itemId);
    if (!item || !proposal.proposedContent) {
      return NextResponse.json(
        { message: "Proposal target or proposed content not found" },
        { status: 404 },
      );
    }

    const currentContent = canonicalizeContent(item);
    const currentHash = contentHash(currentContent);
    if (
      item._updatedAt !== proposal.baseItemUpdatedAt ||
      currentHash !== proposal.baseContentHash
    ) {
      await markProposal(
        proposal._id,
        "stale",
        "The item changed after this proposal was created; refresh it again.",
        reviewer,
      );
      return NextResponse.json(
        { message: "Proposal is stale because the item changed" },
        { status: 409 },
      );
    }

    const proposedContent = canonicalizeContent(proposal.proposedContent);
    const changedFields = changedContentFields(currentContent, proposedContent);
    if (!changedFields.length) {
      await markProposal(
        proposal._id,
        "stale",
        "There are no material content changes left to apply.",
        reviewer,
      );
      return NextResponse.json(
        { message: "Proposal has no material changes" },
        { status: 409 },
      );
    }

    const nextSlug = slugify(proposedContent.name);
    if (!proposedContent.name || !proposedContent.link || !nextSlug) {
      throw new Error("Proposal has an invalid name, link, or slug");
    }

    await ensureLinkAndSlugAvailable({
      itemId,
      link: proposedContent.link,
      slug: nextSlug,
    });

    const [categories, tags] = await Promise.all([
      resolveReferences(proposedContent.categories, "category", itemId),
      resolveReferences(proposedContent.tags, "tag", itemId),
    ]);

    const itemPatch: Record<string, unknown> = {
      name: proposedContent.name,
      slug: { _type: "slug", current: nextSlug },
      link: proposedContent.link,
      description: proposedContent.description,
      introduction: proposedContent.introduction,
      categories,
      tags,
    };

    if (proposedContent.imageUrl !== currentContent.imageUrl) {
      const asset = await uploadImageFromUrl(
        proposedContent.imageUrl,
        `${nextSlug}_image.png`,
      );
      itemPatch.image = {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
        alt: `Screenshot of ${proposedContent.name}`,
      };
    }

    if (proposedContent.iconUrl !== currentContent.iconUrl) {
      const asset = await uploadImageFromUrl(
        proposedContent.iconUrl,
        `${nextSlug}_logo.png`,
      );
      itemPatch.icon = {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
        alt: `Logo of ${proposedContent.name}`,
      };
    }

    await client
      .transaction()
      .patch(itemId, { set: itemPatch })
      .patch(proposal._id, {
        set: {
          status: "accepted",
          reviewedAt: new Date().toISOString(),
          reviewedBy: reviewer,
          reviewNote: body.reviewNote || "Accepted by reviewer",
        },
      })
      .commit();

    revalidatePath(`/item/${item.slug || nextSlug}`);
    revalidatePath(`/item/${nextSlug}`);
    revalidatePath("/");

    return NextResponse.json({
      message: "Proposal accepted",
      itemId,
      changedFields,
    });
  } catch (error) {
    console.error("item-update-proposal action failed", error);
    return NextResponse.json(
      { message: String(error instanceof Error ? error.message : error) },
      { status: 500 },
    );
  }
}
