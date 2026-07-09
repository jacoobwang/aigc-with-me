export type StackBuilderOption = {
  label: string;
  value: string;
};

export type StackBuilderTool = {
  name: string;
  role: string;
  reason: string;
  href: string;
  tags: string[];
  budgets: string[];
  platforms: string[];
  useCases: string[];
  preferences: string[];
  personas: string[];
};

export type StackBuilderCategory = {
  title: string;
  description: string;
  tools: StackBuilderTool[];
};

export const personaOptions: StackBuilderOption[] = [
  { label: "Independent Developer", value: "developer" },
  { label: "Content Creator", value: "creator" },
  { label: "Marketing Team", value: "marketer" },
  { label: "Designer", value: "designer" },
  { label: "Student", value: "student" },
  { label: "Founder", value: "founder" },
];

export const budgetOptions: StackBuilderOption[] = [
  { label: "Free", value: "free" },
  { label: "$20 / month", value: "starter" },
  { label: "$100 / month", value: "pro" },
];

export const platformOptions: StackBuilderOption[] = [
  { label: "Web", value: "web" },
  { label: "Mac", value: "mac" },
  { label: "Windows", value: "windows" },
  { label: "Chrome Extension", value: "chrome" },
  { label: "API", value: "api" },
];

export const useCaseOptions: StackBuilderOption[] = [
  { label: "Writing", value: "writing" },
  { label: "Images", value: "images" },
  { label: "Video", value: "video" },
  { label: "Coding", value: "coding" },
  { label: "Automation", value: "automation" },
  { label: "Research", value: "research" },
];

export const preferenceOptions: StackBuilderOption[] = [
  { label: "Chinese Friendly", value: "chinese" },
  { label: "No Login First", value: "no-login" },
  { label: "API Support", value: "api" },
  { label: "Commercial Use", value: "commercial" },
  { label: "Team Collaboration", value: "team" },
];

export const stackBuilderCategories: StackBuilderCategory[] = [
  {
    title: "Chat Model",
    description: "Daily thinking, drafting, analysis, and general execution.",
    tools: [
      {
        name: "ChatGPT",
        role: "General purpose assistant",
        reason: "A balanced default for writing, coding help, image workflows, and broad plugin support.",
        href: "/search?q=ChatGPT",
        tags: ["writing", "coding", "research"],
        budgets: ["free", "starter", "pro"],
        platforms: ["web", "mac", "windows", "api"],
        useCases: ["writing", "coding", "research"],
        preferences: ["api", "team", "commercial"],
        personas: ["developer", "creator", "marketer", "student", "founder"],
      },
      {
        name: "Claude",
        role: "Long-form reasoning assistant",
        reason: "Strong for long documents, structured analysis, coding review, and polished writing.",
        href: "/search?q=Claude",
        tags: ["writing", "coding", "research"],
        budgets: ["starter", "pro"],
        platforms: ["web", "mac", "api"],
        useCases: ["writing", "coding", "research"],
        preferences: ["api", "commercial"],
        personas: ["developer", "creator", "marketer", "student", "founder"],
      },
      {
        name: "Gemini",
        role: "Google-connected assistant",
        reason: "Useful when you already work in Google products or need a strong free starting point.",
        href: "/search?q=Gemini",
        tags: ["writing", "research"],
        budgets: ["free", "starter", "pro"],
        platforms: ["web", "api"],
        useCases: ["writing", "research"],
        preferences: ["chinese", "commercial"],
        personas: ["creator", "marketer", "student", "founder"],
      },
    ],
  },
  {
    title: "Search Research",
    description: "Fact finding, citations, competitor research, and market scans.",
    tools: [
      {
        name: "Perplexity",
        role: "AI answer engine",
        reason: "Best first stop when the task needs sources, quick comparison, and current web context.",
        href: "/search?q=Perplexity",
        tags: ["research", "writing"],
        budgets: ["free", "starter", "pro"],
        platforms: ["web", "mac", "chrome"],
        useCases: ["research", "writing"],
        preferences: ["commercial", "team"],
        personas: ["developer", "creator", "marketer", "student", "founder"],
      },
      {
        name: "Genspark",
        role: "Research page generator",
        reason: "Good for turning an open-ended topic into a browsable research brief.",
        href: "/search?q=Genspark",
        tags: ["research"],
        budgets: ["free", "starter", "pro"],
        platforms: ["web"],
        useCases: ["research", "writing"],
        preferences: ["chinese", "commercial"],
        personas: ["creator", "marketer", "student", "founder"],
      },
    ],
  },
  {
    title: "Image Generation",
    description: "Brand visuals, concept art, social images, and product mockups.",
    tools: [
      {
        name: "Ideogram",
        role: "Text-aware image generator",
        reason: "Strong when the image needs readable text, logos, posters, or social creative.",
        href: "/search?q=Ideogram",
        tags: ["images", "design"],
        budgets: ["free", "starter", "pro"],
        platforms: ["web"],
        useCases: ["images"],
        preferences: ["commercial", "no-login"],
        personas: ["creator", "designer", "marketer", "founder"],
      },
      {
        name: "Midjourney",
        role: "High quality visual generator",
        reason: "Best fit when visual quality and style exploration matter more than exact editing control.",
        href: "/search?q=Midjourney",
        tags: ["images", "design"],
        budgets: ["starter", "pro"],
        platforms: ["web"],
        useCases: ["images"],
        preferences: ["commercial"],
        personas: ["creator", "designer", "marketer", "founder"],
      },
      {
        name: "Canva",
        role: "Design production workspace",
        reason: "Useful for non-designers who need templates, team review, and fast publishing.",
        href: "/search?q=Canva",
        tags: ["images", "writing"],
        budgets: ["free", "starter", "pro"],
        platforms: ["web", "mac", "windows"],
        useCases: ["images", "writing"],
        preferences: ["team", "commercial", "chinese"],
        personas: ["creator", "designer", "marketer", "student", "founder"],
      },
    ],
  },
  {
    title: "Video",
    description: "Short videos, product demos, clips, and visual storytelling.",
    tools: [
      {
        name: "Runway",
        role: "AI video creation suite",
        reason: "Best for polished generation, editing, and creative video workflows.",
        href: "/search?q=Runway",
        tags: ["video"],
        budgets: ["starter", "pro"],
        platforms: ["web"],
        useCases: ["video"],
        preferences: ["commercial", "team"],
        personas: ["creator", "designer", "marketer", "founder"],
      },
      {
        name: "Kling",
        role: "AI video generator",
        reason: "A practical option for high-motion short clips and Chinese-friendly video experimentation.",
        href: "/search?q=Kling",
        tags: ["video"],
        budgets: ["free", "starter", "pro"],
        platforms: ["web"],
        useCases: ["video"],
        preferences: ["chinese", "commercial"],
        personas: ["creator", "designer", "marketer", "founder"],
      },
    ],
  },
  {
    title: "Automation",
    description: "Connect tools, trigger workflows, and reduce repeated manual work.",
    tools: [
      {
        name: "Zapier",
        role: "No-code automation platform",
        reason: "The safest default for non-technical teams because integrations and templates are mature.",
        href: "/search?q=Zapier",
        tags: ["automation"],
        budgets: ["free", "starter", "pro"],
        platforms: ["web"],
        useCases: ["automation"],
        preferences: ["team", "commercial"],
        personas: ["creator", "marketer", "founder"],
      },
      {
        name: "Make",
        role: "Visual automation builder",
        reason: "Better when you need branching logic, cheaper automation volume, and visual debugging.",
        href: "/search?q=Make",
        tags: ["automation"],
        budgets: ["free", "starter", "pro"],
        platforms: ["web"],
        useCases: ["automation"],
        preferences: ["commercial", "api"],
        personas: ["developer", "marketer", "founder"],
      },
      {
        name: "n8n",
        role: "Developer-friendly automation",
        reason: "Best for technical users who want API control, self-hosting options, and custom workflows.",
        href: "/search?q=n8n",
        tags: ["automation", "coding"],
        budgets: ["free", "pro"],
        platforms: ["web", "api"],
        useCases: ["automation", "coding"],
        preferences: ["api", "commercial"],
        personas: ["developer", "founder"],
      },
    ],
  },
  {
    title: "Coding",
    description: "Build apps, refactor code, review changes, and ship faster.",
    tools: [
      {
        name: "Cursor",
        role: "AI code editor",
        reason: "Strong default for developers who want chat, codebase context, and fast implementation loops.",
        href: "/search?q=Cursor",
        tags: ["coding"],
        budgets: ["free", "starter", "pro"],
        platforms: ["mac", "windows"],
        useCases: ["coding"],
        preferences: ["commercial"],
        personas: ["developer", "founder", "student"],
      },
      {
        name: "Windsurf",
        role: "Agentic code editor",
        reason: "Good for multi-file coding sessions where you want an editor-centered agent workflow.",
        href: "/search?q=Windsurf",
        tags: ["coding"],
        budgets: ["free", "starter", "pro"],
        platforms: ["mac", "windows"],
        useCases: ["coding"],
        preferences: ["commercial"],
        personas: ["developer", "founder", "student"],
      },
      {
        name: "GitHub Copilot",
        role: "IDE coding assistant",
        reason: "Best when your workflow already lives in GitHub and mainstream IDEs.",
        href: "/search?q=GitHub%20Copilot",
        tags: ["coding"],
        budgets: ["starter", "pro"],
        platforms: ["mac", "windows"],
        useCases: ["coding"],
        preferences: ["team", "commercial"],
        personas: ["developer", "founder", "student"],
      },
    ],
  },
];

export const defaultStackBuilderState = {
  persona: "developer",
  budget: "starter",
  platforms: ["web", "mac"],
  useCases: ["coding", "research"],
  preferences: ["api", "commercial"],
};
