export type RecommendationChoice = {
  label: string;
  pick: string;
  reason: string;
};

export type ToolOption = {
  name: string;
  bestFor: string;
  tradeoff: string;
  href: string;
};

export type AlternativesPage = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  choices: RecommendationChoice[];
  tools: ToolOption[];
};

export const alternativesPages: AlternativesPage[] = [
  {
    slug: "chatgpt",
    title: "Best ChatGPT Alternatives",
    description:
      "Compare ChatGPT alternatives by writing, research, coding, team workflows, price, and API needs.",
    intro:
      "ChatGPT is a strong default, but it is not always the best fit. Pick an alternative when you need source-first research, longer document handling, Google workspace fit, or a more specialized coding workflow.",
    choices: [
      { label: "If you value Chinese", pick: "Gemini", reason: "It is a strong free starting point and works well for multilingual everyday tasks." },
      { label: "If you value price", pick: "Gemini or Perplexity Free", reason: "Both are useful before committing to a paid general assistant." },
      { label: "If you are a team", pick: "Claude or ChatGPT Team", reason: "Choose based on whether long documents or broad tool ecosystem matters more." },
      { label: "If you need API", pick: "Claude, Gemini, or OpenAI API", reason: "Compare model quality, context window, latency, and cost for your exact workload." },
    ],
    tools: [
      { name: "Claude", bestFor: "Long documents, structured writing, and careful code review.", tradeoff: "Less plugin-centric than ChatGPT.", href: "/search?q=Claude" },
      { name: "Gemini", bestFor: "Google ecosystem users and free-tier exploration.", tradeoff: "Model behavior can vary by product surface.", href: "/search?q=Gemini" },
      { name: "Perplexity", bestFor: "Source-backed web research and comparison.", tradeoff: "Not a full replacement for creative drafting or coding.", href: "/search?q=Perplexity" },
      { name: "Cursor", bestFor: "Developers who primarily need codebase-aware help.", tradeoff: "Too specialized for non-coding workflows.", href: "/search?q=Cursor" },
    ],
  },
  {
    slug: "midjourney",
    title: "Best Midjourney Alternatives",
    description:
      "Compare Midjourney alternatives for text-in-image, commercial work, design production, and free image generation.",
    intro:
      "Midjourney is excellent for visual quality, but alternatives can be better for readable text, brand-safe commercial workflows, or template-based publishing.",
    choices: [
      { label: "If you value Chinese", pick: "Krea or Canva", reason: "Use tools with simpler web workflows and fewer prompt-interface constraints." },
      { label: "If you value price", pick: "Ideogram Free or Canva Free", reason: "They are easier to test before paying for high-volume image work." },
      { label: "If you are a team", pick: "Canva or Adobe Firefly", reason: "They fit review, brand assets, and publishing workflows better." },
      { label: "If you need API", pick: "Stability AI or OpenAI image models", reason: "Pick API-native tools for product integration instead of manual generation." },
    ],
    tools: [
      { name: "Ideogram", bestFor: "Readable text, logos, posters, and social creative.", tradeoff: "Less ideal for cinematic art exploration.", href: "/search?q=Ideogram" },
      { name: "Adobe Firefly", bestFor: "Commercially conservative brand workflows.", tradeoff: "Creative range may feel more constrained.", href: "/search?q=Adobe%20Firefly" },
      { name: "Canva", bestFor: "Templates, teams, and final publishing layouts.", tradeoff: "Not focused on high-end generative art.", href: "/search?q=Canva" },
      { name: "Leonardo AI", bestFor: "Game, concept, and asset-oriented workflows.", tradeoff: "Requires more workflow tuning.", href: "/search?q=Leonardo%20AI" },
    ],
  },
  {
    slug: "runway-free",
    title: "Free Runway Alternatives",
    description:
      "Find free or lower-cost Runway alternatives for short AI videos, product clips, and creative experiments.",
    intro:
      "Runway is powerful for serious AI video work, but free alternatives can be enough for testing motion ideas, short social clips, and early creative direction.",
    choices: [
      { label: "If you value Chinese", pick: "Kling", reason: "It is a strong option for Chinese-friendly AI video experimentation." },
      { label: "If you value price", pick: "Kling or Pika free tiers", reason: "Use free generations to validate the visual direction first." },
      { label: "If you are a team", pick: "Runway", reason: "Team workflows and editing depth matter once video is a repeatable production channel." },
      { label: "If you need API", pick: "API-native video providers", reason: "Manual creative tools are not enough for embedded product workflows." },
    ],
    tools: [
      { name: "Kling", bestFor: "High-motion short clips and Chinese-friendly experiments.", tradeoff: "Availability and limits may vary.", href: "/search?q=Kling" },
      { name: "Pika", bestFor: "Quick creative video tests.", tradeoff: "Output control can be limited.", href: "/search?q=Pika" },
      { name: "CapCut", bestFor: "Editing, captions, and finishing social clips.", tradeoff: "Not a full generation replacement.", href: "/search?q=CapCut" },
      { name: "Luma", bestFor: "Visual experiments and cinematic clips.", tradeoff: "May need multiple iterations for usable shots.", href: "/search?q=Luma" },
    ],
  },
];

export function getAlternativesPage(slug: string) {
  return alternativesPages.find((page) => page.slug === slug);
}
