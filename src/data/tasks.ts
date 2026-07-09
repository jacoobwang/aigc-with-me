import {
  Code2Icon,
  FileImageIcon,
  FileTextIcon,
  ImageIcon,
  MicIcon,
  type LucideIcon,
  SearchCheckIcon,
  VideoIcon,
} from "lucide-react";

export type TaskTool = {
  name: string;
  role: string;
  href: string;
};

export type TaskPlan = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  audience: string[];
  recommendedTools: TaskTool[];
  freePlan: string[];
  paidPlan: string[];
  beginnerSteps: string[];
  alternatives: TaskTool[];
  pitfalls: string[];
};

export const taskPlans: TaskPlan[] = [
  {
    slug: "make-a-logo",
    title: "Make a Logo",
    description:
      "Choose tools for logo concepts, typography exploration, and fast brand mockups.",
    icon: FileImageIcon,
    audience: ["Founders", "Indie makers", "Creators", "Small teams"],
    recommendedTools: [
      { name: "Ideogram", role: "Text-aware logo concepts", href: "/search?q=Ideogram" },
      { name: "Canva", role: "Templates and export workflow", href: "/search?q=Canva" },
      { name: "ChatGPT", role: "Brand positioning and prompt drafting", href: "/search?q=ChatGPT" },
    ],
    freePlan: [
      "Use ChatGPT or Gemini to define the brand keywords and visual direction.",
      "Generate 10-20 rough concepts in Ideogram with text-focused prompts.",
      "Refine the best concept in Canva and export simple social mockups.",
    ],
    paidPlan: [
      "Use Ideogram paid generations for more iterations and commercial workflows.",
      "Use Canva Pro for brand kits, transparent exports, and reusable templates.",
    ],
    beginnerSteps: [
      "Write the company name, audience, tone, and words to avoid.",
      "Generate several style directions before choosing colors.",
      "Test the logo at favicon, social avatar, and landing page sizes.",
    ],
    alternatives: [
      { name: "Midjourney", role: "More visual exploration", href: "/search?q=Midjourney" },
      { name: "Looka", role: "Logo-specific generator", href: "/search?q=Looka" },
    ],
    pitfalls: [
      "Do not treat generated logos as trademark-safe without checking conflicts.",
      "Avoid unreadable text effects and overly complex details.",
      "Confirm commercial-use terms before using generated assets publicly.",
    ],
  },
  {
    slug: "meeting-notes",
    title: "Turn Meeting Audio into Notes",
    description:
      "Convert recordings into summaries, decisions, action items, and searchable notes.",
    icon: MicIcon,
    audience: ["Managers", "Sales teams", "Founders", "Students"],
    recommendedTools: [
      { name: "Otter", role: "Meeting transcription", href: "/search?q=Otter" },
      { name: "Notion AI", role: "Knowledge base formatting", href: "/search?q=Notion%20AI" },
      { name: "Claude", role: "Long-context summary cleanup", href: "/search?q=Claude" },
    ],
    freePlan: [
      "Record or upload the meeting to a free transcription tool.",
      "Paste the transcript into Claude, ChatGPT, or Gemini for summary cleanup.",
      "Store decisions and action items in Notion or Google Docs.",
    ],
    paidPlan: [
      "Use Otter or Fireflies for automatic recording, speaker labels, and integrations.",
      "Use Notion AI or a team workspace to keep searchable meeting history.",
    ],
    beginnerSteps: [
      "Ask for sections: summary, decisions, action items, risks, and open questions.",
      "Keep original transcript links attached for auditability.",
      "Review names, dates, and commitments before sharing notes.",
    ],
    alternatives: [
      { name: "Fireflies", role: "Sales and team meeting capture", href: "/search?q=Fireflies" },
      { name: "Tactiq", role: "Browser-based meeting notes", href: "/search?q=Tactiq" },
    ],
    pitfalls: [
      "Do not upload confidential calls to tools that your company has not approved.",
      "Speaker diarization can be wrong; verify ownership of action items.",
      "Summaries can omit disagreements, so preserve the transcript link.",
    ],
  },
  {
    slug: "short-video",
    title: "Create a Short Video",
    description:
      "Plan, generate, edit, and publish short AI-assisted product or social videos.",
    icon: VideoIcon,
    audience: ["Creators", "Marketers", "Founders", "E-commerce sellers"],
    recommendedTools: [
      { name: "Runway", role: "Generated and edited video", href: "/search?q=Runway" },
      { name: "Kling", role: "High-motion video generation", href: "/search?q=Kling" },
      { name: "CapCut", role: "Fast editing and captions", href: "/search?q=CapCut" },
    ],
    freePlan: [
      "Draft a 15-30 second script with ChatGPT or Claude.",
      "Generate one hero clip with Kling or another free video tool.",
      "Edit captions, cuts, and music in CapCut.",
    ],
    paidPlan: [
      "Use Runway for higher control and reusable creative workflows.",
      "Use paid captioning or editing tools when publishing frequently.",
    ],
    beginnerSteps: [
      "Start with the first three seconds: hook, product, or pain point.",
      "Generate short clips instead of one long clip.",
      "Export versions for TikTok, Reels, Shorts, and X separately.",
    ],
    alternatives: [
      { name: "Pika", role: "Video generation experiments", href: "/search?q=Pika" },
      { name: "Descript", role: "Script and spoken-video editing", href: "/search?q=Descript" },
    ],
    pitfalls: [
      "Do not rely on AI for exact product UI unless you verify every frame.",
      "Check watermark and commercial-use restrictions before publishing.",
      "AI motion artifacts are common; keep scenes short and simple.",
    ],
  },
  {
    slug: "seo-article",
    title: "Write an SEO Article",
    description:
      "Research search intent, build an outline, draft, fact-check, and publish.",
    icon: FileTextIcon,
    audience: ["Content teams", "Founders", "Affiliate marketers", "Bloggers"],
    recommendedTools: [
      { name: "Perplexity", role: "Search intent and source research", href: "/search?q=Perplexity" },
      { name: "ChatGPT", role: "Outline and draft generation", href: "/search?q=ChatGPT" },
      { name: "Surfer SEO", role: "SEO optimization checks", href: "/search?q=Surfer%20SEO" },
    ],
    freePlan: [
      "Use Perplexity to inspect competing pages and gather sources.",
      "Draft the article with ChatGPT or Gemini from a structured outline.",
      "Manually check claims, links, headings, and search intent.",
    ],
    paidPlan: [
      "Use Surfer SEO or similar tools for content gap checks.",
      "Use a paid writing model when you need long, polished drafts faster.",
    ],
    beginnerSteps: [
      "Define the target query and reader intent before drafting.",
      "Ask AI for outline alternatives, not just one full article.",
      "Add original examples, screenshots, or product experience.",
    ],
    alternatives: [
      { name: "Frase", role: "Content brief workflow", href: "/search?q=Frase" },
      { name: "Claude", role: "Long-form editing", href: "/search?q=Claude" },
    ],
    pitfalls: [
      "AI-only articles are easy to make generic; add real evidence.",
      "Do not publish statistics without verifying the source date.",
      "Avoid stuffing keywords where human readers would lose trust.",
    ],
  },
  {
    slug: "ai-coding-project",
    title: "Build an AI Coding Project",
    description:
      "Pick tools for planning, implementation, debugging, and code review.",
    icon: Code2Icon,
    audience: ["Developers", "Founders", "Students", "Technical PMs"],
    recommendedTools: [
      { name: "Cursor", role: "Codebase-aware implementation", href: "/search?q=Cursor" },
      { name: "Claude", role: "Architecture and review", href: "/search?q=Claude" },
      { name: "GitHub Copilot", role: "IDE completions", href: "/search?q=GitHub%20Copilot" },
    ],
    freePlan: [
      "Use a free chat model to write a feature spec and acceptance criteria.",
      "Use Cursor or Windsurf free tiers for small implementation loops.",
      "Run local tests and ask the model to review only the diff.",
    ],
    paidPlan: [
      "Use Cursor Pro or Claude Pro when you need larger context windows.",
      "Use GitHub Copilot for continuous IDE assistance across mature repos.",
    ],
    beginnerSteps: [
      "Start with a small issue and exact files before asking for code.",
      "Commit before large AI edits so changes are easy to inspect.",
      "Require tests, screenshots, or reproduction steps for each change.",
    ],
    alternatives: [
      { name: "Windsurf", role: "Agentic editor workflow", href: "/search?q=Windsurf" },
      { name: "Replit", role: "Browser coding environment", href: "/search?q=Replit" },
    ],
    pitfalls: [
      "Do not accept broad refactors unless they are part of the goal.",
      "AI can invent APIs; compile and test before trusting the patch.",
      "Keep secrets and production credentials out of prompts.",
    ],
  },
  {
    slug: "pdf-knowledge-base",
    title: "Turn PDFs into a Knowledge Base",
    description:
      "Extract, structure, search, and ask questions over PDFs and internal documents.",
    icon: SearchCheckIcon,
    audience: ["Students", "Researchers", "Support teams", "Operators"],
    recommendedTools: [
      { name: "NotebookLM", role: "Document-grounded Q&A", href: "/search?q=NotebookLM" },
      { name: "ChatPDF", role: "Quick PDF questions", href: "/search?q=ChatPDF" },
      { name: "Notion AI", role: "Team knowledge base", href: "/search?q=Notion%20AI" },
    ],
    freePlan: [
      "Upload a small document set to NotebookLM or ChatPDF.",
      "Ask for summaries, key facts, and citations back to the source.",
      "Move stable notes into Notion, Obsidian, or Google Docs.",
    ],
    paidPlan: [
      "Use a paid knowledge base when multiple teammates need shared access.",
      "Use API-based retrieval when you need a custom product workflow.",
    ],
    beginnerSteps: [
      "Separate source documents by topic before upload.",
      "Ask questions that require citations, not just summaries.",
      "Keep file names and document dates visible in the answer.",
    ],
    alternatives: [
      { name: "Humata", role: "Document analysis", href: "/search?q=Humata" },
      { name: "Dify", role: "Custom RAG app builder", href: "/search?q=Dify" },
    ],
    pitfalls: [
      "Scanned PDFs may need OCR before search works well.",
      "Document Q&A can still hallucinate when sources are thin.",
      "Check upload limits, privacy terms, and retention settings.",
    ],
  },
  {
    slug: "commercial-image-generation",
    title: "Find Commercial Image Generators",
    description:
      "Pick image tools with usable licensing, quality, and workflow fit.",
    icon: ImageIcon,
    audience: ["Marketers", "Designers", "Founders", "E-commerce teams"],
    recommendedTools: [
      { name: "Adobe Firefly", role: "Commercial-safe brand workflows", href: "/search?q=Adobe%20Firefly" },
      { name: "Ideogram", role: "Text and poster images", href: "/search?q=Ideogram" },
      { name: "Canva", role: "Template-based publishing", href: "/search?q=Canva" },
    ],
    freePlan: [
      "Shortlist tools with explicit commercial-use documentation.",
      "Generate sample images and check watermark behavior.",
      "Use Canva or Adobe tools for final production layout.",
    ],
    paidPlan: [
      "Use Adobe Firefly for conservative brand and enterprise workflows.",
      "Use paid plans when watermark removal, team assets, or higher volume matters.",
    ],
    beginnerSteps: [
      "Check whether commercial use depends on plan tier.",
      "Save generation prompts and license references with the asset.",
      "Review brand, likeness, and trademark risks before launch.",
    ],
    alternatives: [
      { name: "Midjourney", role: "High-quality creative images", href: "/search?q=Midjourney" },
      { name: "Leonardo AI", role: "Game and creative assets", href: "/search?q=Leonardo%20AI" },
    ],
    pitfalls: [
      "Free tiers may have watermark, attribution, or licensing limits.",
      "Do not use generated likenesses of real people without rights review.",
      "Commercial-safe does not automatically mean trademark-safe.",
    ],
  },
];

export function getTaskPlan(slug: string) {
  return taskPlans.find((task) => task.slug === slug);
}
