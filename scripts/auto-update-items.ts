import { slugify } from "@/lib/utils";
import type { Category, Tag } from "@/sanity.types";
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
import { z } from "zod";

dotenv.config({ path: process.env.ENV_FILE || ".env" });

type AutoUpdateSource = {
  id: string;
  baseUrl: string;
  sitemapUrls: string[];
  listPageUrls: string[];
  includePatterns: RegExp[];
  excludePatterns: RegExp[];
  maxCandidates: number;
};

type Candidate = {
  source: AutoUpdateSource;
  sourceUrl: string;
  targetUrl?: string;
  discoveredAt: string;
};

type ExistingItem = {
  _id: string;
  link?: string;
  slug?: {
    current?: string;
  };
};

type FetchedItem = {
  name: string;
  link: string;
  description: string;
  introduction: string;
  categories: string[];
  tags: string[];
  image: string;
  icon: string;
};

type MicrolinkData = {
  image?: {
    url?: string;
  };
};

type CliOptions = {
  command: "discover" | "dry-run" | "import";
  sources: string[];
  limit: number;
  status: "pending" | "submitting" | "approved";
  dryRun: boolean;
};

type RunSummary = {
  discovered: number;
  resolved: number;
  skippedExisting: number;
  created: number;
  failed: number;
};

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
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

const sources: AutoUpdateSource[] = [
  {
    id: "aiwith",
    baseUrl: "https://aiwith.me",
    sitemapUrls: [
      "https://aiwith.me/sitemap.xml",
      "https://aiwith.me/sitemap_index.xml",
    ],
    listPageUrls: ["https://aiwith.me"],
    includePatterns: [/^https:\/\/aiwith\.me\/[^?#]+/i],
    excludePatterns: [
      /^https:\/\/aiwith\.me\/?$/i,
      /\/(category|categories|tag|tags|blog|post|posts|news|pricing|submit|login|signup|about|contact|privacy|terms|search|page)(\/|$|\?)/i,
      /\.(png|jpe?g|gif|webp|svg|pdf|zip|mp4|mp3)(\?|$)/i,
    ],
    maxCandidates: 25,
  },
  {
    id: "moge",
    baseUrl: "https://moge.ai",
    sitemapUrls: [
      "https://moge.ai/sitemap.xml",
      "https://moge.ai/sitemap_index.xml",
    ],
    listPageUrls: ["https://moge.ai"],
    includePatterns: [/^https:\/\/moge\.ai\/[^?#]+/i],
    excludePatterns: [
      /^https:\/\/moge\.ai\/?$/i,
      /\/(category|categories|tag|tags|blog|post|posts|news|pricing|submit|login|signup|about|contact|privacy|terms|search|page)(\/|$|\?)/i,
      /\.(png|jpe?g|gif|webp|svg|pdf|zip|mp4|mp3)(\?|$)/i,
    ],
    maxCandidates: 25,
  },
];

const itemSchema = z.object({
  title: z.string().describe("A short, concise product name without tagline"),
  description: z.string().max(160).describe("One sentence summary"),
  introduction: z.string().describe("Detailed introduction in markdown format"),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
});

const fetchText = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; AIGCwithMeBot/1.0; +https://aigcwith.me)",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
};

const normalizeUrl = (rawUrl: string, baseUrl?: string) => {
  try {
    const url = new URL(rawUrl, baseUrl);
    if (!["http:", "https:"].includes(url.protocol)) return null;

    url.hash = "";
    for (const key of Array.from(url.searchParams.keys())) {
      if (
        key.startsWith("utm_") ||
        ["ref", "ref_src", "fbclid", "gclid", "mc_cid", "mc_eid"].includes(key)
      ) {
        url.searchParams.delete(key);
      }
    }

    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.slice(0, -1);
    }

    return url.toString();
  } catch {
    return null;
  }
};

const getUrlIdentity = (rawUrl: string) => {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) return rawUrl;
  const url = new URL(normalized);
  url.protocol = "https:";
  url.hostname = url.hostname.replace(/^www\./, "");
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return `${url.hostname}${url.pathname}${url.search}`;
};

const isCandidateUrl = (source: AutoUpdateSource, url: string) => {
  return (
    source.includePatterns.some((pattern) => pattern.test(url)) &&
    !source.excludePatterns.some((pattern) => pattern.test(url))
  );
};

const extractUrlsFromXml = (xml: string) => {
  return Array.from(xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)).map((match) =>
    match[1].trim(),
  );
};

const extractLinksFromHtml = (html: string, baseUrl: string) => {
  return Array.from(
    html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi),
  ).map((match) => ({
    href: normalizeUrl(match[1], baseUrl),
    text: match[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  }));
};

const discoverFromSitemap = async (source: AutoUpdateSource) => {
  const urls: string[] = [];

  for (const sitemapUrl of source.sitemapUrls) {
    try {
      const xml = await fetchText(sitemapUrl);
      const locs = extractUrlsFromXml(xml);
      const nestedSitemaps = locs.filter((url) => /sitemap/i.test(url));
      const pageUrls = locs.filter((url) => !/sitemap/i.test(url));
      urls.push(...pageUrls);

      for (const nested of nestedSitemaps.slice(0, 20)) {
        try {
          const nestedXml = await fetchText(nested);
          urls.push(...extractUrlsFromXml(nestedXml));
        } catch (error) {
          console.warn(
            JSON.stringify({
              level: "warn",
              source: source.id,
              url: nested,
              reason: `nested sitemap failed: ${String(error)}`,
            }),
          );
        }
      }
    } catch (error) {
      console.warn(
        JSON.stringify({
          level: "warn",
          source: source.id,
          url: sitemapUrl,
          reason: `sitemap failed: ${String(error)}`,
        }),
      );
    }
  }

  return urls;
};

const discoverFromListPages = async (source: AutoUpdateSource) => {
  const urls: string[] = [];

  for (const listPageUrl of source.listPageUrls) {
    try {
      const html = await fetchText(listPageUrl);
      urls.push(
        ...extractLinksFromHtml(html, listPageUrl)
          .map((link) => link.href)
          .filter((href): href is string => Boolean(href)),
      );
    } catch (error) {
      console.warn(
        JSON.stringify({
          level: "warn",
          source: source.id,
          url: listPageUrl,
          reason: `list page failed: ${String(error)}`,
        }),
      );
    }
  }

  return urls;
};

const discoverCandidates = async (selectedSources: AutoUpdateSource[]) => {
  const candidates: Candidate[] = [];
  const seen = new Set<string>();
  const discoveredAt = new Date().toISOString();

  for (const source of selectedSources) {
    const sitemapUrls = await discoverFromSitemap(source);
    const rawUrls = sitemapUrls.length
      ? sitemapUrls
      : await discoverFromListPages(source);

    for (const rawUrl of rawUrls) {
      const url = normalizeUrl(rawUrl, source.baseUrl);
      if (!url || !isCandidateUrl(source, url)) continue;

      const identity = getUrlIdentity(url);
      if (seen.has(identity)) continue;
      seen.add(identity);

      candidates.push({ source, sourceUrl: url, discoveredAt });
      if (
        candidates.filter((candidate) => candidate.source.id === source.id)
          .length >= source.maxCandidates
      ) {
        break;
      }
    }
  }

  return candidates;
};

const isLikelyUtilityExternal = (url: URL) => {
  const hostname = url.hostname.replace(/^www\./, "");
  return [
    "facebook.com",
    "x.com",
    "twitter.com",
    "linkedin.com",
    "instagram.com",
    "youtube.com",
    "tiktok.com",
    "discord.gg",
    "discord.com",
    "reddit.com",
    "pinterest.com",
    "producthunt.com",
    "apps.apple.com",
    "play.google.com",
  ].some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
};

const unwrapExternalUrl = (href: string, baseUrl: string) => {
  const normalized = normalizeUrl(href, baseUrl);
  if (!normalized) return null;

  const url = new URL(normalized);
  for (const key of [
    "url",
    "u",
    "target",
    "redirect",
    "redirect_url",
    "destination",
    "dest",
    "to",
  ]) {
    const value = url.searchParams.get(key);
    const unwrapped = value ? normalizeUrl(value) : null;
    if (unwrapped) return unwrapped;
  }

  return normalized;
};

const resolveTargetUrl = async (candidate: Candidate) => {
  const html = await fetchText(candidate.sourceUrl);
  const sourceHost = new URL(candidate.source.baseUrl).hostname.replace(
    /^www\./,
    "",
  );
  const links = extractLinksFromHtml(html, candidate.sourceUrl)
    .filter((link) => link.href)
    .map((link) => ({
      ...link,
      href: unwrapExternalUrl(link.href as string, candidate.sourceUrl),
    }))
    .filter((link) => link.href)
    .map((link) => ({
      ...link,
      url: new URL(link.href as string),
    }))
    .filter(({ url }) => url.hostname.replace(/^www\./, "") !== sourceHost)
    .filter(({ url }) => !isLikelyUtilityExternal(url));

  if (!links.length) return null;

  const scored = links
    .map((link) => {
      const haystack = `${link.text} ${link.href}`.toLowerCase();
      let score = 0;
      if (
        /official|website|visit|open|launch|try|get started|start|官网/.test(
          haystack,
        )
      ) {
        score += 20;
      }
      if (/\/out\/|\/go\/|redirect|target=|url=/.test(haystack)) score += 5;
      if (link.url.pathname === "/" || link.url.pathname === "") score += 3;
      return { ...link, score };
    })
    .sort((a, b) => b.score - a.score);

  return normalizeUrl(scored[0].href as string);
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

const stripHtmlForPrompt = (html: string) => {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60000);
};

const fetchItemInfo = async (url: string): Promise<FetchedItem | null> => {
  const [categories, tags, microlinkData, html] = await Promise.all([
    getClient().fetch<Category[]>(`*[_type == "category"]`),
    getClient().fetch<Tag[]>(`*[_type == "tag"]`),
    mql(url)
      .then((result) => (result as { data?: MicrolinkData }).data ?? null)
      .catch(() => null),
    fetchText(url),
  ]);

  const availableCategories = categories.map((category) => category.name);
  const availableTags = tags.map((tag) => tag.name);
  const result = await generateObject({
    model: getAiModel() as never,
    schema: itemSchema,
    prompt: `Analyze this AI tool/service website and return original directory listing content.

Website URL:
${url}

Website content:
${stripHtmlForPrompt(html)}

Available Categories:
${availableCategories.join(", ")}

Available Tags:
${availableTags.join(", ")}

Return:
1. A concise product name only.
2. A one-sentence description under 160 characters.
3. A markdown introduction with practical features and use cases.
4. Category names selected only from the available categories.
5. Tag names selected only from the available tags.

Write original text based on the official website. Do not copy text from aggregator or source pages.`,
  });

  const image =
    microlinkData?.image?.url ||
    `https://image.thum.io/get/width/1200/crop/800/${url}`;
  const icon = `https://s2.googleusercontent.com/s2/favicons?domain=${url}&sz=128`;

  return {
    name: result.object.title,
    link: url,
    description: result.object.description,
    introduction: result.object.introduction,
    categories: result.object.categories.filter((category) =>
      availableCategories.includes(category),
    ),
    tags: result.object.tags.filter((tag) => availableTags.includes(tag)),
    image,
    icon,
  };
};

const getExistingItems = async () => {
  const items = await getClient().fetch<ExistingItem[]>(
    `*[_type == "item"]{ _id, link, slug }`,
  );
  return {
    links: new Set(
      items
        .map((item) => item.link)
        .filter((link): link is string => Boolean(link))
        .map(getUrlIdentity),
    ),
    slugs: new Set(
      items
        .map((item) => item.slug?.current)
        .filter((slug): slug is string => Boolean(slug)),
    ),
  };
};

const findCategory = (categories: Category[], names: string[]) => {
  return categories.filter((category) => names.includes(category.name));
};

const findTag = (tags: Tag[], names: string[]) => {
  return tags.filter((tag) => names.includes(tag.name));
};

const uploadImage = async (url: string, filename: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`asset fetch failed ${response.status} for ${url}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return getClient().assets.upload("image", Buffer.from(arrayBuffer), {
    filename,
  });
};

const createPendingItem = async (
  item: FetchedItem,
  candidate: Candidate,
  status: CliOptions["status"],
) => {
  const [categories, tags] = await Promise.all([
    getClient().fetch<Category[]>(`*[_type == "category"]`),
    getClient().fetch<Tag[]>(`*[_type == "tag"]`),
  ]);
  const itemCategories = findCategory(categories, item.categories);
  const itemTags = findTag(tags, item.tags);
  const slug = slugify(item.name);
  const [iconAsset, imageAsset] = await Promise.all([
    uploadImage(item.icon, `${slug}_logo.png`),
    uploadImage(item.image, `${slug}_image.png`),
  ]);

  return getClient().create({
    _type: "item",
    name: item.name,
    slug: {
      _type: "slug",
      current: slug,
    },
    link: item.link,
    description: item.description,
    publishDate: null,
    pricePlan: "free",
    freePlanStatus: status,
    introduction: item.introduction,
    categories: itemCategories.map((category, index) => ({
      _type: "reference",
      _ref: category._id,
      _key: index.toString(),
    })),
    tags: itemTags.map((tag, index) => ({
      _type: "reference",
      _ref: tag._id,
      _key: index.toString(),
    })),
    icon: {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: iconAsset._id,
      },
      alt: `Logo of ${item.name}`,
    },
    image: {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: imageAsset._id,
      },
      alt: `Screenshot of ${item.name}`,
    },
    autoImported: true,
    sourceName: candidate.source.id,
    sourceUrl: candidate.sourceUrl,
    discoveredAt: candidate.discoveredAt,
    importedAt: new Date().toISOString(),
    importNote: `Auto imported from ${candidate.source.id}; review before publishing.`,
  });
};

const parseArgs = (): CliOptions => {
  const argv = process.argv.slice(2);
  const command = (argv[0] || "import") as CliOptions["command"];
  const options: CliOptions = {
    command,
    sources: ["all"],
    limit: 20,
    status: "pending",
    dryRun: command === "dry-run",
  };

  for (let i = 1; i < argv.length; i++) {
    const token = argv[i];
    if (token === "--sources") {
      options.sources = (argv[i + 1] || "all")
        .split(",")
        .map((source) => source.trim())
        .filter(Boolean);
      i++;
    } else if (token === "--limit") {
      options.limit = Number.parseInt(argv[i + 1] || "20", 10);
      i++;
    } else if (token === "--status") {
      options.status = (argv[i + 1] || "pending") as CliOptions["status"];
      i++;
    } else if (token === "--dry-run") {
      options.dryRun = argv[i + 1] !== "false";
      if (argv[i + 1] && !argv[i + 1].startsWith("--")) i++;
    }
  }

  if (!["discover", "dry-run", "import"].includes(options.command)) {
    throw new Error("Command must be discover, dry-run, or import");
  }
  if (!["pending", "submitting", "approved"].includes(options.status)) {
    throw new Error("Status must be pending, submitting, or approved");
  }

  return options;
};

const selectSources = (sourceIds: string[]) => {
  if (sourceIds.includes("all")) return sources;
  const selected = sources.filter((source) => sourceIds.includes(source.id));
  if (!selected.length) {
    throw new Error(`No matching sources for: ${sourceIds.join(", ")}`);
  }
  return selected;
};

const writeGithubSummary = async (summary: RunSummary) => {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  const { appendFile } = await import("node:fs/promises");
  await appendFile(
    process.env.GITHUB_STEP_SUMMARY,
    [
      "## Auto Update Items",
      "",
      `- Discovered: ${summary.discovered}`,
      `- Resolved target URLs: ${summary.resolved}`,
      `- Skipped existing: ${summary.skippedExisting}`,
      `- Created: ${summary.created}`,
      `- Failed: ${summary.failed}`,
      "",
    ].join("\n"),
  );
};

const run = async () => {
  const options = parseArgs();
  const selectedSources = selectSources(options.sources);
  const summary: RunSummary = {
    discovered: 0,
    resolved: 0,
    skippedExisting: 0,
    created: 0,
    failed: 0,
  };

  const candidates = (await discoverCandidates(selectedSources)).slice(
    0,
    options.limit,
  );
  summary.discovered = candidates.length;
  console.log(
    JSON.stringify({
      event: "discovered",
      count: candidates.length,
      sources: selectedSources.map((source) => source.id),
    }),
  );

  if (options.command === "discover") {
    for (const candidate of candidates) {
      console.log(
        JSON.stringify({
          source: candidate.source.id,
          sourceUrl: candidate.sourceUrl,
        }),
      );
    }
    await writeGithubSummary(summary);
    return;
  }

  const existing = await getExistingItems();

  for (const candidate of candidates) {
    try {
      const targetUrl = await resolveTargetUrl(candidate);
      if (!targetUrl) {
        summary.failed++;
        console.warn(
          JSON.stringify({
            event: "skip",
            source: candidate.source.id,
            sourceUrl: candidate.sourceUrl,
            reason: "target_url_not_found",
          }),
        );
        continue;
      }

      candidate.targetUrl = targetUrl;
      summary.resolved++;

      if (existing.links.has(getUrlIdentity(targetUrl))) {
        summary.skippedExisting++;
        console.log(
          JSON.stringify({
            event: "skip",
            source: candidate.source.id,
            sourceUrl: candidate.sourceUrl,
            targetUrl,
            reason: "existing_link",
          }),
        );
        continue;
      }

      const item = await fetchItemInfo(targetUrl);
      if (!item) {
        summary.failed++;
        continue;
      }

      const slug = slugify(item.name);
      if (existing.slugs.has(slug)) {
        summary.skippedExisting++;
        console.log(
          JSON.stringify({
            event: "skip",
            source: candidate.source.id,
            sourceUrl: candidate.sourceUrl,
            targetUrl,
            name: item.name,
            reason: "existing_slug",
          }),
        );
        continue;
      }

      if (options.dryRun) {
        console.log(
          JSON.stringify({
            event: "dry_run_ready",
            source: candidate.source.id,
            sourceUrl: candidate.sourceUrl,
            targetUrl,
            name: item.name,
            slug,
          }),
        );
        continue;
      }

      const created = await createPendingItem(item, candidate, options.status);
      existing.links.add(getUrlIdentity(item.link));
      existing.slugs.add(slug);
      summary.created++;
      console.log(
        JSON.stringify({
          event: "created",
          id: created._id,
          source: candidate.source.id,
          sourceUrl: candidate.sourceUrl,
          targetUrl,
          name: item.name,
        }),
      );
    } catch (error) {
      summary.failed++;
      console.error(
        JSON.stringify({
          event: "failed",
          source: candidate.source.id,
          sourceUrl: candidate.sourceUrl,
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
