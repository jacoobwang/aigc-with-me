import type { RecommendationChoice, ToolOption } from "@/data/seo-pages";
import { ArrowRightIcon, CheckCircle2Icon } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";

export function ChoiceGrid({ choices }: { choices: RecommendationChoice[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {choices.map((choice) => (
        <div key={choice.label} className="rounded-lg border bg-background p-5">
          <Badge variant="secondary">{choice.label}</Badge>
          <h2 className="mt-4 text-xl font-semibold">{choice.pick}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {choice.reason}
          </p>
        </div>
      ))}
    </section>
  );
}

export function ToolOptionGrid({ tools }: { tools: ToolOption[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {tools.map((tool) => (
        <Link
          key={tool.name}
          href={tool.href}
          className="group rounded-lg border bg-background p-5 transition-colors hover:bg-muted/40"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">{tool.name}</h2>
            <ArrowRightIcon className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p className="flex gap-2">
              <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span>{tool.bestFor}</span>
            </p>
            <p className="text-muted-foreground">{tool.tradeoff}</p>
          </div>
        </Link>
      ))}
    </section>
  );
}
