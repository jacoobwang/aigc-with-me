"use server";

import {
  budgetOptions,
  defaultStackBuilderState,
  personaOptions,
  platformOptions,
  preferenceOptions,
  useCaseOptions,
} from "@/data/stack-builder";
import { sanityClient } from "@/sanity/lib/client";
import { deepseek } from "@ai-sdk/deepseek";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";

type BuilderState = typeof defaultStackBuilderState;

export type StackBuilderDatabaseTool = {
  id: string;
  name: string;
  description: string;
  href: string;
  tags: string[];
  categories: string[];
};

const optionValues = <T extends { value: string }>(options: T[]) =>
  options.map((option) => option.value) as [string, ...string[]];

const StackPlannerSchema = z.object({
  summary: z
    .string()
    .describe("A concise one sentence summary of the user's AI workflow need."),
  persona: z.enum(optionValues(personaOptions)).describe("Best matched role."),
  budget: z.enum(optionValues(budgetOptions)).describe("Best matched budget."),
  platforms: z
    .array(z.enum(optionValues(platformOptions)))
    .min(1)
    .describe("Platforms the user is likely to use."),
  useCases: z
    .array(z.enum(optionValues(useCaseOptions)))
    .min(1)
    .describe("AI work types needed by the user."),
  preferences: z
    .array(z.enum(optionValues(preferenceOptions)))
    .describe("Tool preferences implied by the user's request."),
  keywords: z
    .array(z.string())
    .min(3)
    .max(12)
    .describe("Search keywords for matching existing tools in the directory."),
});

type StackPlannerResult = z.infer<typeof StackPlannerSchema>;

const normalizedOptions = {
  personas: personaOptions.map((option) => `${option.label}: ${option.value}`),
  budgets: budgetOptions.map((option) => `${option.label}: ${option.value}`),
  platforms: platformOptions.map(
    (option) => `${option.label}: ${option.value}`,
  ),
  useCases: useCaseOptions.map((option) => `${option.label}: ${option.value}`),
  preferences: preferenceOptions.map(
    (option) => `${option.label}: ${option.value}`,
  ),
};

function getConfiguredModel(): unknown {
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

  return null;
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function fallbackAnalyze(prompt: string): StackPlannerResult {
  const text = prompt.toLowerCase();
  const state: BuilderState = { ...defaultStackBuilderState };

  if (includesAny(text, ["founder", "startup", "创业", "创始人"])) {
    state.persona = "founder";
  } else if (includesAny(text, ["design", "designer", "设计"])) {
    state.persona = "designer";
  } else if (includesAny(text, ["marketing", "marketer", "增长", "营销"])) {
    state.persona = "marketer";
  } else if (includesAny(text, ["creator", "content", "自媒体", "创作者"])) {
    state.persona = "creator";
  } else if (includesAny(text, ["student", "study", "学生", "学习"])) {
    state.persona = "student";
  }

  if (includesAny(text, ["free", "zero", "免费", "不要付费"])) {
    state.budget = "free";
  } else if (includesAny(text, ["team", "公司", "团队", "budget", "预算高"])) {
    state.budget = "pro";
  }

  const platforms = new Set<string>();
  if (includesAny(text, ["web", "browser", "网页", "浏览器"]))
    platforms.add("web");
  if (includesAny(text, ["mac", "macos", "苹果"])) platforms.add("mac");
  if (includesAny(text, ["windows", "win"])) platforms.add("windows");
  if (includesAny(text, ["chrome", "extension", "插件", "扩展"]))
    platforms.add("chrome");
  if (includesAny(text, ["api", "integrate", "集成", "接口"]))
    platforms.add("api");
  state.platforms = platforms.size ? Array.from(platforms) : state.platforms;

  const useCases = new Set<string>();
  if (includesAny(text, ["write", "writing", "copy", "文案", "写作"]))
    useCases.add("writing");
  if (includesAny(text, ["image", "poster", "logo", "图片", "海报", "设计图"]))
    useCases.add("images");
  if (includesAny(text, ["video", "短视频", "视频"])) useCases.add("video");
  if (includesAny(text, ["code", "coding", "app", "开发", "代码"]))
    useCases.add("coding");
  if (includesAny(text, ["automation", "workflow", "自动化", "工作流"]))
    useCases.add("automation");
  if (includesAny(text, ["research", "search", "调研", "搜索", "资料"]))
    useCases.add("research");
  state.useCases = useCases.size ? Array.from(useCases) : state.useCases;

  const preferences = new Set<string>();
  if (includesAny(text, ["中文", "chinese", "国内"]))
    preferences.add("chinese");
  if (includesAny(text, ["no login", "不用登录", "免登录"]))
    preferences.add("no-login");
  if (includesAny(text, ["api", "接口", "集成"])) preferences.add("api");
  if (includesAny(text, ["commercial", "商用", "商业"]))
    preferences.add("commercial");
  if (includesAny(text, ["team", "collaboration", "团队", "协作"]))
    preferences.add("team");
  state.preferences = preferences.size
    ? Array.from(preferences)
    : state.preferences;

  const keywords = Array.from(
    new Set([
      ...state.useCases,
      ...state.preferences,
      ...prompt
        .split(/[\s,，。.!?！？、]+/)
        .map((word) => word.trim())
        .filter((word) => word.length > 2)
        .slice(0, 8),
    ]),
  ).slice(0, 12);

  return {
    summary: prompt.slice(0, 120),
    persona: state.persona,
    budget: state.budget,
    platforms: state.platforms,
    useCases: state.useCases,
    preferences: state.preferences,
    keywords,
  };
}

async function analyzePrompt(prompt: string) {
  const model = getConfiguredModel();

  if (!model) {
    return fallbackAnalyze(prompt);
  }

  try {
    const result = await generateObject({
      model: model as never,
      schema: StackPlannerSchema,
      prompt: `Analyze the user's natural-language request and map it to the allowed AI stack builder values.

Allowed personas:
${normalizedOptions.personas.join("\n")}

Allowed budgets:
${normalizedOptions.budgets.join("\n")}

Allowed platforms:
${normalizedOptions.platforms.join("\n")}

Allowed use cases:
${normalizedOptions.useCases.join("\n")}

Allowed preferences:
${normalizedOptions.preferences.join("\n")}

User request:
${prompt}

Return only values from the allowed lists. Infer sensible defaults when the user is vague.`,
    });

    return result.object;
  } catch (error) {
    console.error("planStackFromPrompt, LLM analysis failed:", error);
    return fallbackAnalyze(prompt);
  }
}

function scoreDatabaseTool(
  tool: StackBuilderDatabaseTool,
  analysis: StackPlannerResult,
) {
  const searchable = [
    tool.name,
    tool.description,
    ...tool.tags,
    ...tool.categories,
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const keyword of analysis.keywords) {
    if (keyword && searchable.includes(keyword.toLowerCase())) score += 3;
  }
  for (const useCase of analysis.useCases) {
    if (searchable.includes(useCase)) score += 4;
  }
  for (const preference of analysis.preferences) {
    if (searchable.includes(preference)) score += 1;
  }
  return score;
}

async function recommendDatabaseTools(analysis: StackPlannerResult) {
  const items = await sanityClient.fetch<StackBuilderDatabaseTool[]>(
    `*[_type == "item" && defined(slug.current)
      && defined(publishDate)
      && forceHidden != true
      && sponsor != true] | order(coalesce(featured, false) desc, publishDate desc) [0...160] {
        "id": _id,
        name,
        "description": coalesce(description, ""),
        "href": "/item/" + slug.current,
        "tags": coalesce(tags[]->name, []),
        "categories": coalesce(categories[]->name, [])
      }`,
  );

  return items
    .map((tool) => ({
      tool,
      score: scoreDatabaseTool(tool, analysis),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ tool }) => tool);
}

export async function planStackFromPrompt(prompt: string) {
  const normalizedPrompt = prompt.trim();

  if (normalizedPrompt.length < 6) {
    return {
      status: "error" as const,
      message: "Tell us a little more about your workflow.",
    };
  }

  try {
    const analysis = await analyzePrompt(normalizedPrompt);
    const databaseTools = await recommendDatabaseTools(analysis);

    return {
      status: "success" as const,
      data: {
        summary: analysis.summary,
        keywords: analysis.keywords,
        state: {
          persona: analysis.persona,
          budget: analysis.budget,
          platforms: analysis.platforms,
          useCases: analysis.useCases,
          preferences: analysis.preferences,
        },
        databaseTools,
      },
    };
  } catch (error) {
    console.error("planStackFromPrompt, error:", error);
    return {
      status: "error" as const,
      message: "Unable to plan a stack right now. Please try again.",
    };
  }
}
