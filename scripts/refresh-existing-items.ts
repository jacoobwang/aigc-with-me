import {
  canonicalizeContent,
  changedContentFields,
  contentHash,
  sourceSnapshotHash,
  summarizeChangedFields,
  type ItemRefreshContent,
} from "@/lib/item-refresh";
import { deepseek } from "@ai-sdk/deepseek";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";
import mql from "@microlink/mql";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createClient } from "@sanity/client";
import { generateObject } from "ai";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { createHash } from "node:crypto";
import { z } from "zod";

dotenv.config({ path: process.env.ENV_FILE || ".env" });

type ExistingItem = ItemRefreshContent & {
  _id: string;
  _updatedAt: string;
  slug?: string;
  autoImported?: boolean;
  publishDate?: string;
  forceHidden?: boolean;
  sourceName?: string;
  sourceUrl?: string;
};

type RefreshState = {
  _id: string;
  lastSourceHash?: string;
};

type CliOptions = {
  dryRun: boolean;
  limit: number;
  itemId?: string;
};

type RunSummary = {
  discovered: number;
  skippedPending: number;
  skippedUnchanged: number;
  skippedNoDiff: number;
  created: number;
  failed: number;
};

type MicrolinkData = {
  image?: {
    url?: string;
  };
};

const proposalSchema = z.object({
  title: z.string().describe("A concise product name without a tagline"),
  description: z.string().max(160).describe("One sentence summary"),
  introduction: z.string().describe("Detailed introduction in markdown"),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
});

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
};

let sanityClient: ReturnType<typeof createClient> | null = null;

const getClient = () => {
  sanityClient ??= createClient({
    projectId: requireEnv("NEXT_PUBLIC_SANITY_PROJECT_ID"),
    dataset: requireEnv("NEXT_PUBLIC_SANITY_DATASET"),
    apiVersion: "2024-08-01",
    useCdn: false,
    perspective: "published",
    token: requireEnv("SANITY_API_TOKEN"),
  });

  return sanityClient;
};

const getAiModel = (): unknown => {
  if (
    process.env.DEFAULT_AI_PROVIDER === "google" &&
    process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ) {
    return google("gemini-2.0-flash-exp", { structuredOutputs: true });
  }

  if (
    process.env.DEFAULT_AI_PROVIDER === "deepseek" &&
    process.env.DEEPSEEK_API_KEY
  ) {
    return deepseek("deepseek-chat");
  }

  if (
    process.env.DEFAULT_AI_PROVIDER === "openai" &&
    process.env.OPENAI_API_KEY
  ) {
    return openai("gpt-4o-mini", { structuredOutputs: true });
  }

  if (process.env.DEFAULT_AI_PROVIDER === "xai" && process.env.XAI_API_KEY) {
    return xai("grok-3-beta");
  }

  if (
    process.env.DEFAULT_AI_PROVIDER === "openrouter" &&
    process.env.OPENROUTER_API_KEY
  ) {
    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });
    return openrouter.chat(
      process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet",
    );
  }

  throw new Error("Missing DEFAULT_AI_PROVIDER or provider API key");
};

const fetchText = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; AIGCwithMeRefreshBot/1.0; +https://aigcwith.me)",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
};

const stripHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

const normalizeUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return value;
    url.hash = "";
    for (const key of Array.from(url.searchParams.keys())) {
      if (
        key.startsWith("utm_") ||
        ["ref", "ref_src", "fbclid", "gclid", "mc_cid", "mc_eid"].includes(
          key,
        )
      ) {
        url.searchParams.delete(key);
      }
    }
    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return url.toString();
  } catch {
    return value;
  }
};

const getExistingItems = async (itemId?: string) => {
  const params = itemId ? { itemId } : {};
  const filter = itemId
    ? ` && _id == $itemId`
    : "";
  return getClient().fetch<ExistingItem[]>(
    `*[_type == "item" && autoImported == true && defined(publishDate) && forceHidden != true && defined(link)${filter}] {
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
      "iconUrl": icon.asset->url,
      autoImported,
      publishDate,
      forceHidden,
      sourceName,
      sourceUrl
    }`,
    params,
  );
};

const getPendingItemIds = async () => {
  const proposals = await getClient().fetch<{ itemId?: string }[]>(
    `*[_type == "itemUpdateProposal" && status == "pending"]{
      "itemId": item._ref
    }`,
  );
  return new Set(
    proposals
      .map((proposal) => proposal.itemId)
      .filter((itemId): itemId is string => Boolean(itemId)),
  );
};

const getRefreshState = async (itemId: string) =>
  getClient().fetch<RefreshState | null>(
    `*[_type == "itemRefreshState" && item._ref == $itemId][0]{
      _id,
      lastSourceHash
    }`,
    { itemId },
  );

const getExistingProposalForHash = async (
  itemId: string,
  sourceHash: string,
) =>
  getClient().fetch<{ _id: string; status: string } | null>(
    `*[_type == "itemUpdateProposal" && item._ref == $itemId && sourceHash == $sourceHash][0]{
      _id,
      status
    }`,
    { itemId, sourceHash },
  );

const getStateId = (itemId: string) =>
  `item-refresh-state-${itemId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

const writeRefreshState = async ({
  item,
  sourceHash,
  checkedAt,
  proposalId,
  lastError,
}: {
  item: ExistingItem;
  sourceHash?: string;
  checkedAt: string;
  proposalId?: string;
  lastError?: string;
}) => {
  const client = getClient();
  const stateId = getStateId(item._id);
  await client.createIfNotExists({
    _id: stateId,
    _type: "itemRefreshState",
    item: { _type: "reference", _ref: item._id },
  });

  await client
    .patch(stateId)
    .set({
      ...(sourceHash ? { lastSourceHash: sourceHash } : {}),
      lastCheckedAt: checkedAt,
      ...(proposalId
        ? {
            lastProposal: {
              _type: "reference",
              _ref: proposalId,
            },
          }
        : {}),
      lastError: lastError || null,
    })
    .commit();
};

const getAvailableTaxonomy = async () => {
  const [categories, tags] = await Promise.all([
    getClient().fetch<{ name: string }[]>(`*[_type == "category"]{name}`),
    getClient().fetch<{ name: string }[]>(`*[_type == "tag"]{name}`),
  ]);

  return {
    categories: categories.map((category) => category.name),
    tags: tags.map((tag) => tag.name),
  };
};

const fetchProposedContent = async (
  item: ExistingItem,
  sourceText: string,
  taxonomy: Awaited<ReturnType<typeof getAvailableTaxonomy>>,
): Promise<ItemRefreshContent> => {
  const result = await generateObject({
    model: getAiModel() as never,
    schema: proposalSchema,
    prompt: `Review an existing AI tool directory entry against its official website and return a proposed refreshed version.

Official URL:
${item.link}

Official website content:
${sourceText.slice(0, 60000)}

Current directory content:
${JSON.stringify(canonicalizeContent(item), null, 2)}

Available categories:
${taxonomy.categories.join(", ")}

Available tags:
${taxonomy.tags.join(", ")}

Rules:
1. Use only facts supported by the official website.
2. Preserve the current name unless the official website clearly uses a different product name.
3. Preserve the official URL exactly unless it is clearly canonicalized by the website.
4. Return original directory copy; do not copy an aggregator's wording.
5. Select categories and tags only from the available lists.
6. Keep the description under 160 characters.
7. Return a useful markdown introduction, but do not invent pricing, features, or integrations.
`,
  });

  const microlinkData = await mql(item.link)
    .then((result) => (result as { data?: MicrolinkData }).data ?? null)
    .catch(() => null);

  return canonicalizeContent({
    name: result.object.title,
    link: normalizeUrl(item.link),
    description: result.object.description,
    introduction: result.object.introduction,
    categories: result.object.categories.filter((category) =>
      taxonomy.categories.includes(category),
    ),
    tags: result.object.tags.filter((tag) => taxonomy.tags.includes(tag)),
    imageUrl: microlinkData?.image?.url || item.imageUrl,
    iconUrl: item.iconUrl,
  });
};

const proposalIdFor = (itemId: string, sourceHash: string) =>
  `item-update-proposal-${createHash("sha256")
    .update(`${itemId}:${sourceHash}`)
    .digest("hex")
    .slice(0, 32)}`;

const createProposal = async ({
  item,
  sourceHash,
  capturedAt,
  currentContent,
  proposedContent,
  changedFields,
}: {
  item: ExistingItem;
  sourceHash: string;
  capturedAt: string;
  currentContent: ItemRefreshContent;
  proposedContent: ItemRefreshContent;
  changedFields: ReturnType<typeof changedContentFields>;
}) => {
  const proposalId = proposalIdFor(item._id, sourceHash);
  const client = getClient();
  await client.createIfNotExists({
    _id: proposalId,
    _type: "itemUpdateProposal",
    item: { _type: "reference", _ref: item._id },
    status: "pending",
    sourceName: item.sourceName || "unknown",
    sourceUrl: item.sourceUrl || item.link,
    officialUrl: item.link,
    sourceHash,
    capturedAt,
    baseItemUpdatedAt: item._updatedAt,
    baseContentHash: contentHash(currentContent),
    currentContent,
    proposedContent,
    changedFields,
    diffSummary: summarizeChangedFields(changedFields),
  });
  return proposalId;
};

const parseArgs = (): CliOptions => {
  const argv = process.argv.slice(2);
  const command = argv[0] || "run";
  const options: CliOptions = {
    dryRun: command === "dry-run",
    limit: 50,
  };

  for (let index = 1; index < argv.length; index++) {
    const token = argv[index];
    if (token === "--limit") {
      options.limit = Number.parseInt(argv[index + 1] || "50", 10);
      index++;
    } else if (token === "--item-id") {
      options.itemId = argv[index + 1];
      index++;
    } else if (token === "--dry-run") {
      options.dryRun = argv[index + 1] !== "false";
      if (argv[index + 1] && !argv[index + 1].startsWith("--")) index++;
    }
  }

  if (!["run", "dry-run"].includes(command)) {
    throw new Error("Command must be run or dry-run");
  }
  if (!Number.isFinite(options.limit) || options.limit < 1) {
    throw new Error("--limit must be a positive integer");
  }

  return options;
};

const writeGithubSummary = async (summary: RunSummary) => {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  const { appendFile } = await import("node:fs/promises");
  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    [
      "## Refresh Existing Items",
      "",
      `- Discovered: ${summary.discovered}`,
      `- Skipped pending: ${summary.skippedPending}`,
      `- Skipped unchanged: ${summary.skippedUnchanged}`,
      `- Skipped without material diff: ${summary.skippedNoDiff}`,
      `- Created proposals: ${summary.created}`,
      `- Failed: ${summary.failed}`,
      "",
    ].join("\n"),
  );
};

const run = async () => {
  const options = parseArgs();
  const items = (await getExistingItems(options.itemId)).slice(0, options.limit);
  const pendingItemIds = await getPendingItemIds();
  const taxonomy = await getAvailableTaxonomy();
  const summary: RunSummary = {
    discovered: items.length,
    skippedPending: 0,
    skippedUnchanged: 0,
    skippedNoDiff: 0,
    created: 0,
    failed: 0,
  };

  for (const item of items) {
    const checkedAt = new Date().toISOString();

    if (pendingItemIds.has(item._id)) {
      summary.skippedPending++;
      console.log(
        JSON.stringify({ event: "skip", itemId: item._id, reason: "pending_proposal" }),
      );
      continue;
    }

    try {
      const html = await fetchText(item.link);
      const sourceText = stripHtml(html);
      const sourceHash = sourceSnapshotHash(sourceText);
      const state = await getRefreshState(item._id);

      if (state?.lastSourceHash === sourceHash) {
        summary.skippedUnchanged++;
        if (!options.dryRun) {
          await writeRefreshState({ item, sourceHash, checkedAt });
        }
        console.log(
          JSON.stringify({ event: "skip", itemId: item._id, reason: "source_unchanged" }),
        );
        continue;
      }

      const existingProposal = await getExistingProposalForHash(
        item._id,
        sourceHash,
      );
      if (existingProposal) {
        summary.skippedUnchanged++;
        if (!options.dryRun) {
          await writeRefreshState({ item, sourceHash, checkedAt });
        }
        console.log(
          JSON.stringify({
            event: "skip",
            itemId: item._id,
            proposalId: existingProposal._id,
            reason: "source_already_reviewed",
          }),
        );
        continue;
      }

      const currentContent = canonicalizeContent(item);
      const proposedContent = await fetchProposedContent(
        item,
        sourceText,
        taxonomy,
      );
      const changedFields = changedContentFields(
        currentContent,
        proposedContent,
      );

      if (!changedFields.length) {
        summary.skippedNoDiff++;
        if (!options.dryRun) {
          await writeRefreshState({ item, sourceHash, checkedAt });
        }
        console.log(
          JSON.stringify({ event: "skip", itemId: item._id, reason: "no_material_diff" }),
        );
        continue;
      }

      if (options.dryRun) {
        console.log(
          JSON.stringify({
            event: "dry_run_proposal",
            itemId: item._id,
            name: item.name,
            sourceHash,
            changedFields,
          }),
        );
        continue;
      }

      const proposalId = await createProposal({
        item,
        sourceHash,
        capturedAt: checkedAt,
        currentContent,
        proposedContent,
        changedFields,
      });
      await writeRefreshState({
        item,
        sourceHash,
        checkedAt,
        proposalId,
      });
      summary.created++;
      console.log(
        JSON.stringify({
          event: "created",
          itemId: item._id,
          proposalId,
          changedFields,
        }),
      );
    } catch (error) {
      summary.failed++;
      if (!options.dryRun) {
        await writeRefreshState({
          item,
          checkedAt,
          lastError: String(error),
        }).catch((stateError) => {
          console.error(
            JSON.stringify({
              event: "state_write_failed",
              itemId: item._id,
              reason: String(stateError),
            }),
          );
        });
      }
      console.error(
        JSON.stringify({
          event: "failed",
          itemId: item._id,
          link: item.link,
          reason: String(error),
        }),
      );
    }
  }

  console.log(JSON.stringify({ event: "summary", ...summary }));
  await writeGithubSummary(summary);
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
