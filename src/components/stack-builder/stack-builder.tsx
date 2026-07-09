"use client";

import {
  budgetOptions,
  defaultStackBuilderState,
  personaOptions,
  platformOptions,
  preferenceOptions,
  stackBuilderCategories,
  type StackBuilderTool,
  useCaseOptions,
} from "@/data/stack-builder";
import { cn } from "@/lib/utils";
import {
  CheckIcon,
  CopyIcon,
  LayersIcon,
  LinkIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

type BuilderState = typeof defaultStackBuilderState;

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

function OptionButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function MultiOptionGroup({
  options,
  values,
  onChange,
}: {
  options: { label: string; value: string }[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = values.includes(option.value);
        return (
          <OptionButton
            key={option.value}
            active={active}
            onClick={() => {
              if (active) {
                onChange(values.filter((value) => value !== option.value));
                return;
              }
              onChange([...values, option.value]);
            }}
          >
            {option.label}
          </OptionButton>
        );
      })}
    </div>
  );
}

export function StackBuilder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
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
    params.set("persona", state.persona);
    params.set("budget", state.budget);
    params.set("platforms", state.platforms.join(","));
    params.set("useCases", state.useCases.join(","));
    params.set("preferences", state.preferences.join(","));
    return params;
  }, [state]);

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
    router.replace(`${pathname}?${shareParams.toString()}`, { scroll: false });
  }, [pathname, router, shareParams]);

  async function copyShareLink() {
    const url = `${window.location.origin}${pathname}?${shareParams.toString()}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
      <aside className="h-fit rounded-lg border bg-background p-5">
        <div className="mb-5 flex items-center gap-2">
          <SlidersHorizontalIcon className="h-4 w-4 text-indigo-500" />
          <h2 className="text-lg font-semibold">Builder Inputs</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Identity</h3>
            <div className="flex flex-wrap gap-2">
              {personaOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  active={state.persona === option.value}
                  onClick={() =>
                    setState((current) => ({
                      ...current,
                      persona: option.value,
                    }))
                  }
                >
                  {option.label}
                </OptionButton>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Budget</h3>
            <div className="flex flex-wrap gap-2">
              {budgetOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  active={state.budget === option.value}
                  onClick={() =>
                    setState((current) => ({
                      ...current,
                      budget: option.value,
                    }))
                  }
                >
                  {option.label}
                </OptionButton>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Platform</h3>
            <MultiOptionGroup
              options={platformOptions}
              values={state.platforms}
              onChange={(platforms) =>
                setState((current) => ({ ...current, platforms }))
              }
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Use Case</h3>
            <MultiOptionGroup
              options={useCaseOptions}
              values={state.useCases}
              onChange={(useCases) =>
                setState((current) => ({ ...current, useCases }))
              }
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Preference</h3>
            <MultiOptionGroup
              options={preferenceOptions}
              values={state.preferences}
              onChange={(preferences) =>
                setState((current) => ({ ...current, preferences }))
              }
            />
          </div>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 rounded-lg border bg-muted/30 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-md bg-indigo-500/10 p-2 text-indigo-600">
              <LayersIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Recommended AI Stack</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ranked from your identity, budget, platform, use case, and
                preference selections.
              </p>
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
