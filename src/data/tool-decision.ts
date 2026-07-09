import type { ItemFullInfo } from "@/types";

export type ToolDecisionCard = {
  verdict: string;
  bestFor: string[];
  notFor: string[];
  bestUses: string[];
  priceSummary: string;
  freeAllowance: string;
  pros: string[];
  cons: string[];
  alternatives: { name: string; href: string }[];
  comparisons: { label: string; href: string }[];
  quickStartPrompt: string;
};

const decisionOverrides: Record<string, Partial<ToolDecisionCard>> = {
  chatgpt: {
    verdict:
      "Choose ChatGPT when you need one flexible AI assistant for writing, research, coding help, and multimodal work.",
    bestFor: ["General productivity", "Writing", "Coding help", "AI beginners"],
    notFor: ["Strict source-only research", "Fully private offline work"],
    bestUses: ["Drafting and rewriting", "Brainstorming", "Code explanation", "Image and data tasks"],
    priceSummary: "Free entry tier with paid plans for stronger models and higher limits.",
    freeAllowance: "Free access is usually available, but model access and limits can change.",
    pros: ["Broad capability", "Large ecosystem", "Good beginner experience"],
    cons: ["Can hallucinate", "Best features may require a paid plan", "Privacy review is still needed for sensitive data"],
    alternatives: [
      { name: "Claude", href: "/search?q=Claude" },
      { name: "Gemini", href: "/search?q=Gemini" },
      { name: "Perplexity", href: "/search?q=Perplexity" },
    ],
    comparisons: [
      { label: "Perplexity vs ChatGPT Search", href: "/compare/perplexity-vs-chatgpt-search" },
      { label: "Best ChatGPT Alternatives", href: "/alternatives/chatgpt" },
    ],
  },
  claude: {
    verdict:
      "Choose Claude when long documents, careful writing, and structured reasoning matter more than plugins.",
    bestFor: ["Long-form writing", "Document analysis", "Code review", "Structured thinking"],
    notFor: ["Image generation", "Plugin-heavy workflows"],
    bestUses: ["Summarizing long material", "Editing drafts", "Reviewing code", "Planning complex work"],
    alternatives: [
      { name: "ChatGPT", href: "/search?q=ChatGPT" },
      { name: "Gemini", href: "/search?q=Gemini" },
    ],
    comparisons: [{ label: "Best ChatGPT Alternatives", href: "/alternatives/chatgpt" }],
  },
  perplexity: {
    verdict:
      "Choose Perplexity when the answer needs sources, current web context, and fast comparison.",
    bestFor: ["Research", "Market scans", "Citation-backed answers", "Competitor checks"],
    notFor: ["Private internal documents", "Long creative drafting"],
    bestUses: ["Search intent research", "Source collection", "Product comparison", "Fact checks"],
    alternatives: [
      { name: "ChatGPT Search", href: "/search?q=ChatGPT%20Search" },
      { name: "Genspark", href: "/search?q=Genspark" },
    ],
    comparisons: [
      { label: "Perplexity vs ChatGPT Search", href: "/compare/perplexity-vs-chatgpt-search" },
    ],
  },
  midjourney: {
    verdict:
      "Choose Midjourney when visual quality and style exploration are more important than exact layout control.",
    bestFor: ["Concept art", "Marketing visuals", "Moodboards", "Creative exploration"],
    notFor: ["Precise UI mockups", "Strict brand-safe production without review"],
    bestUses: ["High-quality image concepts", "Style exploration", "Campaign visuals"],
    alternatives: [
      { name: "Ideogram", href: "/search?q=Ideogram" },
      { name: "Adobe Firefly", href: "/search?q=Adobe%20Firefly" },
    ],
    comparisons: [{ label: "Best Midjourney Alternatives", href: "/alternatives/midjourney" }],
  },
  ideogram: {
    verdict:
      "Choose Ideogram when your generated image needs readable text, posters, logos, or social creative.",
    bestFor: ["Text-heavy images", "Logo drafts", "Posters", "Social content"],
    notFor: ["Video", "Complex image editing"],
    bestUses: ["Logo concepts", "Ad creatives", "Typography exploration"],
    alternatives: [
      { name: "Midjourney", href: "/search?q=Midjourney" },
      { name: "Canva", href: "/search?q=Canva" },
    ],
    comparisons: [{ label: "Best Midjourney Alternatives", href: "/alternatives/midjourney" }],
  },
  runway: {
    verdict:
      "Choose Runway when you need a serious AI video workspace for generation, editing, and creative iteration.",
    bestFor: ["Short video", "Product demos", "Creative video teams", "AI-assisted editing"],
    notFor: ["One-off free experiments only", "Exact factual product footage without review"],
    bestUses: ["Text-to-video", "Video editing", "Campaign clips", "Storyboarding"],
    alternatives: [
      { name: "Kling", href: "/search?q=Kling" },
      { name: "Pika", href: "/search?q=Pika" },
    ],
    comparisons: [{ label: "Free Runway Alternatives", href: "/alternatives/runway-free" }],
  },
  cursor: {
    verdict:
      "Choose Cursor when you want an AI-native editor that can understand and modify a real codebase.",
    bestFor: ["Developers", "AI coding projects", "Refactors", "Codebase Q&A"],
    notFor: ["Non-coding tasks", "Teams that cannot install a separate editor"],
    bestUses: ["Feature implementation", "Code review", "Debugging", "Repository navigation"],
    alternatives: [
      { name: "Windsurf", href: "/search?q=Windsurf" },
      { name: "GitHub Copilot", href: "/search?q=GitHub%20Copilot" },
    ],
    comparisons: [{ label: "Cursor vs Windsurf", href: "/compare/cursor-vs-windsurf" }],
  },
  windsurf: {
    verdict:
      "Choose Windsurf when you want an agentic coding workflow centered inside the editor.",
    bestFor: ["Developers", "Multi-file changes", "Agentic coding", "Code exploration"],
    notFor: ["Non-technical users", "Teams standardized on another IDE"],
    bestUses: ["Implementation sessions", "Codebase navigation", "AI-assisted debugging"],
    alternatives: [
      { name: "Cursor", href: "/search?q=Cursor" },
      { name: "GitHub Copilot", href: "/search?q=GitHub%20Copilot" },
    ],
    comparisons: [{ label: "Cursor vs Windsurf", href: "/compare/cursor-vs-windsurf" }],
  },
  zapier: {
    verdict:
      "Choose Zapier when non-technical teams need reliable automations across popular SaaS tools.",
    bestFor: ["Marketing teams", "Ops teams", "No-code automation", "SaaS integrations"],
    notFor: ["Deep custom code", "Very high-volume low-cost automation"],
    bestUses: ["Lead routing", "Notifications", "CRM updates", "Simple AI automations"],
    alternatives: [
      { name: "Make", href: "/search?q=Make" },
      { name: "n8n", href: "/search?q=n8n" },
    ],
  },
  canva: {
    verdict:
      "Choose Canva when you need fast design production, templates, team review, and publishing assets.",
    bestFor: ["Marketers", "Creators", "Small teams", "Non-designers"],
    notFor: ["Advanced bespoke design systems", "Developer automation"],
    bestUses: ["Social images", "Presentations", "Brand templates", "Quick layouts"],
    alternatives: [
      { name: "Adobe Express", href: "/search?q=Adobe%20Express" },
      { name: "Ideogram", href: "/search?q=Ideogram" },
    ],
  },
};

function normalizeName(name?: string | null) {
  return (name || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getCategoryNames(item: ItemFullInfo) {
  return (item.categories || [])
    .map((category) => category?.name)
    .filter(Boolean) as string[];
}

function defaultDecision(item: ItemFullInfo): ToolDecisionCard {
  const categories = getCategoryNames(item);
  const categoryText = categories.length ? categories.join(", ") : "AI workflows";
  const toolName = item.name || "this tool";

  return {
    verdict: `Consider ${toolName} when your workflow matches ${categoryText} and you want to validate the fit before committing to a paid stack.`,
    bestFor: categories.length
      ? categories.slice(0, 4)
      : ["AI beginners", "Productivity workflows", "Tool exploration"],
    notFor: [
      "Highly regulated data without a privacy review",
      "Workflows that require exact deterministic output",
    ],
    bestUses: [
      item.description || `Exploring whether ${toolName} fits your task`,
      "Comparing against similar tools",
      "Building a first working workflow",
    ],
    priceSummary:
      "Check the current pricing page before buying because AI tool limits and plans change often.",
    freeAllowance:
      "If a free tier exists, use it to test output quality, export limits, and workflow fit first.",
    pros: ["Clear task fit", "Can reduce manual work", "Good candidate for side-by-side testing"],
    cons: [
      "Pricing and limits may change",
      "Output quality depends on prompts and source material",
      "Commercial and privacy terms need review",
    ],
    alternatives: [
      { name: "ChatGPT", href: "/search?q=ChatGPT" },
      { name: "Claude", href: "/search?q=Claude" },
      { name: "Perplexity", href: "/search?q=Perplexity" },
    ],
    comparisons: [
      { label: "Browse alternatives", href: `/search?q=${encodeURIComponent(toolName)}` },
    ],
    quickStartPrompt: `I want to evaluate ${toolName} for this task: [describe your task]. Compare the free path, paid path, setup steps, expected output quality, privacy risks, and alternatives.`,
  };
}

export function getToolDecisionCard(item: ItemFullInfo): ToolDecisionCard {
  const base = defaultDecision(item);
  const normalized = normalizeName(item.name);
  const overrideKey = Object.keys(decisionOverrides).find((key) =>
    normalized.includes(key),
  );

  if (!overrideKey) return base;

  return {
    ...base,
    ...decisionOverrides[overrideKey],
  };
}
