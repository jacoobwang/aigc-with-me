import type { ToolDecisionCard } from "@/data/tool-decision";
import {
  AlertCircleIcon,
  BadgeCheckIcon,
  CheckCircle2Icon,
  CopyIcon,
  GitCompareIcon,
  LightbulbIcon,
  SparklesIcon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

function BulletList({
  items,
  icon,
}: {
  items: string[];
  icon: React.ReactNode;
}) {
  return (
    <ul className="space-y-2 text-sm leading-relaxed">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          {icon}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ItemDecisionCard({
  decision,
}: {
  decision: ToolDecisionCard;
}) {
  return (
    <section className="rounded-lg border bg-background p-6">
      <div className="mb-5 flex items-center gap-2">
        <SparklesIcon className="h-4 w-4 text-indigo-500" />
        <h2 className="text-lg font-semibold">Decision Card</h2>
      </div>

      <div className="rounded-md bg-muted/50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <BadgeCheckIcon className="h-4 w-4 text-indigo-500" />
          <h3 className="font-semibold">Quick Verdict</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {decision.verdict}
        </p>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold">Best For</h3>
          <BulletList
            items={decision.bestFor}
            icon={
              <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            }
          />
        </div>
        <div>
          <h3 className="mb-3 font-semibold">Not For</h3>
          <BulletList
            items={decision.notFor}
            icon={
              <XCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
            }
          />
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold">Best Uses</h3>
          <div className="flex flex-wrap gap-2">
            {decision.bestUses.map((use) => (
              <Badge key={use} variant="secondary">
                {use}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">Pricing Snapshot</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {decision.priceSummary}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {decision.freeAllowance}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold">Pros</h3>
          <BulletList
            items={decision.pros}
            icon={
              <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            }
          />
        </div>
        <div>
          <h3 className="mb-3 font-semibold">Cons</h3>
          <BulletList
            items={decision.cons}
            icon={
              <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            }
          />
        </div>
      </div>

      <div className="mt-5 rounded-md bg-muted/50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <LightbulbIcon className="h-4 w-4 text-indigo-500" />
          <h3 className="font-semibold">Quick Start Prompt</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {decision.quickStartPrompt}
        </p>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="mb-3 font-semibold">Alternatives</h3>
          <div className="flex flex-wrap gap-2">
            {decision.alternatives.map((alternative) => (
              <Button
                key={alternative.name}
                asChild
                size="sm"
                variant="outline"
              >
                <Link href={alternative.href}>{alternative.name}</Link>
              </Button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">Compare</h3>
          <div className="flex flex-wrap gap-2">
            {decision.comparisons.map((comparison) => (
              <Button
                key={comparison.label}
                asChild
                size="sm"
                variant="outline"
              >
                <Link href={comparison.href}>
                  <GitCompareIcon className="mr-2 h-3.5 w-3.5" />
                  {comparison.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
