import { createHash } from "node:crypto";

export const REFRESHABLE_CONTENT_FIELDS = [
  "name",
  "link",
  "description",
  "introduction",
  "categories",
  "tags",
  "imageUrl",
  "iconUrl",
] as const;

export type RefreshableContentField =
  (typeof REFRESHABLE_CONTENT_FIELDS)[number];

export type ItemRefreshContent = {
  name: string;
  link: string;
  description: string;
  introduction: string;
  categories: string[];
  tags: string[];
  imageUrl: string;
  iconUrl: string;
};

const normalizeText = (value: unknown) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeUrl = (value: unknown) => {
  const raw = normalizeText(value);
  if (!raw) return "";

  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return raw;
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
    return raw;
  }
};

const normalizeList = (value: unknown) =>
  Array.from(
    new Set(
      (Array.isArray(value) ? value : [])
        .map(normalizeText)
        .filter(Boolean),
    ),
  ).sort((left, right) => left.localeCompare(right));

export const canonicalizeContent = (
  content: Partial<ItemRefreshContent> | null | undefined,
): ItemRefreshContent => ({
  name: normalizeText(content?.name),
  link: normalizeUrl(content?.link),
  description: normalizeText(content?.description),
  introduction: normalizeText(content?.introduction),
  categories: normalizeList(content?.categories),
  tags: normalizeList(content?.tags),
  imageUrl: normalizeUrl(content?.imageUrl),
  iconUrl: normalizeUrl(content?.iconUrl),
});

export const serializeContent = (content: Partial<ItemRefreshContent>) =>
  JSON.stringify(canonicalizeContent(content));

export const contentHash = (content: Partial<ItemRefreshContent>) =>
  createHash("sha256").update(serializeContent(content)).digest("hex");

export const sourceSnapshotHash = (text: string) =>
  createHash("sha256")
    .update(text.replace(/\s+/g, " ").trim())
    .digest("hex");

export const changedContentFields = (
  current: Partial<ItemRefreshContent>,
  proposed: Partial<ItemRefreshContent>,
): RefreshableContentField[] => {
  const currentContent = canonicalizeContent(current);
  const proposedContent = canonicalizeContent(proposed);

  return REFRESHABLE_CONTENT_FIELDS.filter(
    (field) =>
      JSON.stringify(currentContent[field]) !==
      JSON.stringify(proposedContent[field]),
  );
};

export const summarizeChangedFields = (
  fields: RefreshableContentField[],
) => fields.map((field) => `${field} changed`);
