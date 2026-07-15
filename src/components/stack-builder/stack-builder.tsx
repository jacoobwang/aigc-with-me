"use client";

import {
  type StackBuilderDatabaseTool,
  planStackFromPrompt,
} from "@/actions/stack-builder";
import {
  type StackBuilderTool,
  budgetOptions,
  defaultStackBuilderState,
  personaOptions,
  platformOptions,
  preferenceOptions,
  stackBuilderCategories,
  useCaseOptions,
} from "@/data/stack-builder";
import {
  AlertCircleIcon,
  CheckIcon,
  CopyIcon,
  LayersIcon,
  LinkIcon,
  Loader2Icon,
  SendIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

type BuilderState = typeof defaultStackBuilderState;

const promptExamples = [
  "I am an independent developer building a SaaS. I want AI help for research, coding, and automated launches, with a budget of around $20/month.",
  "We are a marketing team looking for Chinese-friendly content writing, poster design, and short video tools, ideally with team collaboration and commercial use.",
  "I am a student looking for free tools for paper research, English writing, and class presentations, without signing up for too many accounts at the start.",
];

type PlannerStatus = "idle" | "loading" | "ready" | "error";

function readList(value: string | null, fallback: string[]) {
  return value ? value.split(",").filter(Boolean) : fallback;
}

function scoreTool(tool: StackBuilderTool, state: BuilderState) {
  let score = 0;

  if (tool.personas.includes(state.persona)) score += 4;
  if (tool.budgets.includes(state.budget)) score += 4;

  score += state.platforms.filter((platform) =>
    tool.platforms.includes(platform),
  ).length;
  score +=
    state.useCases.filter((useCase) => tool.useCases.includes(useCase)).length *
    3;
  score += state.preferences.filter((preference) =>
    tool.preferences.includes(preference),
  ).length;

  return score;
}

function getOptionLabel(
  options: { label: string; value: string }[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function getOptionLabels(
  options: { label: string; value: string }[],
  values: string[],
) {
  return values.map((value) => getOptionLabel(options, value));
}

export function StackBuilder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const resultPrompt = searchParams.get("prompt")?.trim() ?? "";
  const hasResultPrompt = resultPrompt.length > 0;
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState(resultPrompt || "");
  const [summary, setSummary] = useState(
    "Tell us what you want to build or improve. The planner will infer a stack and match tools already in the directory.",
  );
  const [databaseTools, setDatabaseTools] = useState<
    StackBuilderDatabaseTool[]
  >([]);
  const [error, setError] = useState("");
  const [plannerStatus, setPlannerStatus] = useState<PlannerStatus>(
    hasResultPrompt ? "loading" : "idle",
  );
  const [state, setState] = useState<BuilderState>({
    persona: searchParams.get("persona") || defaultStackBuilderState.persona,
    budget: searchParams.get("budget") || defaultStackBuilderState.budget,
    platforms: readList(
      searchParams.get("platforms"),
      defaultStackBuilderState.platforms,
    ),
    useCases: readList(
      searchParams.get("useCases"),
      defaultStackBuilderState.useCases,
    ),
    preferences: readList(
      searchParams.get("preferences"),
      defaultStackBuilderState.preferences,
    ),
  });

  const shareParams = useMemo(() => {
    const params = new URLSearchParams();
    if (hasResultPrompt) params.set("prompt", resultPrompt);
    params.set("persona", state.persona);
    params.set("budget", state.budget);
    params.set("platforms", state.platforms.join(","));
    params.set("useCases", state.useCases.join(","));
    params.set("preferences", state.preferences.join(","));
    return params;
  }, [hasResultPrompt, resultPrompt, state]);

  const resultGroups = useMemo(() => {
    return stackBuilderCategories
      .map((category) => {
        const tools = category.tools
          .map((tool) => ({ tool, score: scoreTool(tool, state) }))
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 2)
          .map(({ tool }) => tool);

        return { ...category, tools };
      })
      .filter((category) => category.tools.length > 0);
  }, [state]);

  useEffect(() => {
    if (resultPrompt) setPrompt(resultPrompt);
  }, [resultPrompt]);

  useEffect(() => {
    if (!hasResultPrompt) {
      setPlannerStatus("idle");
      setError("");
      setDatabaseTools([]);
      return;
    }

    let ignore = false;

    async function planFromUrlPrompt() {
      setError("");
      setPlannerStatus("loading");

      try {
        const result = await planStackFromPrompt(resultPrompt);

        if (ignore) return;

        if (result.status === "error") {
          setError(result.message);
          setPlannerStatus("error");
          return;
        }

        setState(result.data.state);
        setSummary(result.data.summary);
        setDatabaseTools(result.data.databaseTools);
        setPlannerStatus("ready");
      } catch (error) {
        if (ignore) return;
        console.error("planFromUrlPrompt, error:", error);
        setError("Unable to plan a stack right now. Please try again.");
        setPlannerStatus("error");
      }
    }

    planFromUrlPrompt();

    return () => {
      ignore = true;
    };
  }, [hasResultPrompt, resultPrompt]);

  useEffect(() => {
    if (!hasResultPrompt || plannerStatus !== "ready") return;
    router.replace(`${pathname}?${shareParams.toString()}`, { scroll: false });
  }, [hasResultPrompt, pathname, plannerStatus, router, shareParams]);

  async function copyShareLink() {
    const url = `${window.location.origin}${pathname}?${shareParams.toString()}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function goToResult(nextPrompt?: string) {
    const promptValue = nextPrompt ?? promptRef.current?.value ?? prompt;
    const value = promptValue.trim();
    if (!value) return;

    setPrompt(value);
    setError("");
    const params = new URLSearchParams();
    params.set("prompt", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  const isPlanning = plannerStatus === "loading";

  const chatPanel = (
    <aside className="h-fit bg-background p-6">
      <div className="mb-5 flex items-center gap-2">
        <SparklesIcon className="h-4 w-4 text-indigo-500" />
        <h2 className="text-lg font-semibold">
          Build a practical AI tool stack for your work
        </h2>
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          goToResult();
        }}
      >
        <Textarea
          ref={promptRef}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              goToResult();
            }
          }}
          placeholder="Describe your role, budget, platform, workflow, and constraints..."
          className="min-h-52 resize-none text-base leading-relaxed"
        />

        {error ? (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Press Enter to view results. Use Shift + Enter for a new line.
          </p>
          <Button type="submit" disabled={isPlanning}>
            {isPlanning ? (
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="mr-2 h-4 w-4" />
            )}
            {hasResultPrompt ? "Replan" : "Send"}
          </Button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold">Examples</h3>
        <div className="space-y-2">
          {promptExamples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => goToResult(example)}
              className="w-full rounded-md border bg-muted/30 p-3 text-left text-sm leading-relaxed transition-colors hover:bg-muted"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {hasResultPrompt && plannerStatus !== "idle" ? (
        <div className="mt-6 space-y-3 border-t pt-5">
          <h3 className="text-sm font-semibold">Parsed Stack</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {getOptionLabel(personaOptions, state.persona)}
            </Badge>
            <Badge variant="secondary">
              {getOptionLabel(budgetOptions, state.budget)}
            </Badge>
            {getOptionLabels(platformOptions, state.platforms).map((label) => (
              <Badge key={label} variant="secondary">
                {label}
              </Badge>
            ))}
            {getOptionLabels(useCaseOptions, state.useCases).map((label) => (
              <Badge key={label} variant="secondary">
                {label}
              </Badge>
            ))}
            {getOptionLabels(preferenceOptions, state.preferences).map(
              (label) => (
                <Badge key={label} variant="secondary">
                  {label}
                </Badge>
              ),
            )}
          </div>
        </div>
      ) : null}
    </aside>
  );

  if (!hasResultPrompt) {
    return <div className="mx-auto w-full max-w-4xl">{chatPanel}</div>;
  }

  if (isPlanning) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
        {chatPanel}
        <section className="flex min-h-72 items-center justify-center rounded-lg border bg-muted/30 p-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2Icon className="h-4 w-4 animate-spin text-indigo-500" />
            Analyzing your request and matching tools...
          </div>
        </section>
      </div>
    );
  }

  if (plannerStatus === "error") {
    return <div className="mx-auto w-full max-w-4xl">{chatPanel}</div>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
      {chatPanel}

      <section className="space-y-6">
        <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-md bg-indigo-500/10 p-2 text-indigo-600">
              <LayersIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Recommended AI Stack</h2>
              <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
            </div>
          </div>

          <Button type="button" variant="outline" onClick={copyShareLink}>
            {copied ? (
              <CheckIcon className="mr-2 h-4 w-4" />
            ) : (
              <CopyIcon className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy Link"}
          </Button>
        </div>

        {databaseTools.length > 0 ? (
          <div className="rounded-lg border bg-background p-5">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-indigo-500" />
              <h3 className="font-semibold">Directory Matches</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Existing tools from the database that match the plan.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {databaseTools.map((tool) => (
                <div key={tool.id} className="rounded-md bg-muted/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">{tool.name}</h4>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={tool.href}>
                        <LinkIcon className="mr-2 h-3.5 w-3.5" />
                        View
                      </Link>
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[...tool.categories, ...tool.tags]
                      .slice(0, 5)
                      .map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {resultGroups.map((category) => (
            <div
              key={category.title}
              className="flex flex-col gap-4 rounded-lg border bg-background p-5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4 text-indigo-500" />
                  <h3 className="font-semibold">{category.title}</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>

              <div className="space-y-3">
                {category.tools.map((tool) => (
                  <div key={tool.name} className="rounded-md bg-muted/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="font-semibold">{tool.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {tool.role}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={tool.href}>
                          <LinkIcon className="mr-2 h-3.5 w-3.5" />
                          View Tools
                        </Link>
                      </Button>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed">
                      {tool.reason}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tool.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
