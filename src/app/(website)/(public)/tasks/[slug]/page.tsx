import Container from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTaskPlan, taskPlans } from "@/data/tasks";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  SparklesIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return taskPlans.map((task) => ({ slug: task.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata | undefined {
  const task = getTaskPlan(params.slug);
  if (!task) return;

  return constructMetadata({
    title: task.title,
    description: task.description,
    canonicalUrl: `${siteConfig.url}/tasks/${task.slug}`,
  });
}

function ListSection({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-background p-5">
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h2 className="font-semibold">{title}</h2>
      </div>
      <ul className="space-y-3 text-sm leading-relaxed">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function TaskDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const task = getTaskPlan(params.slug);
  if (!task) return notFound();

  const Icon = task.icon;

  return (
    <Container className="my-12 flex flex-col gap-8">
      <Button asChild variant="ghost" className="w-fit px-0">
        <Link href="/tasks">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to tasks
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-5 inline-flex rounded-md bg-indigo-500/10 p-3 text-indigo-600">
            <Icon className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold text-balance md:text-5xl">
            {task.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            {task.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {task.audience.map((person) => (
              <Badge key={person} variant="secondary">
                {person}
              </Badge>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-lg border bg-muted/30 p-5">
          <div className="mb-4 flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 text-indigo-500" />
            <h2 className="font-semibold">Recommended Combination</h2>
          </div>
          <div className="space-y-3">
            {task.recommendedTools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="block rounded-md bg-background p-4 transition-colors hover:bg-muted"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tool.role}
                    </p>
                  </div>
                  <ExternalLinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ListSection title="Free Plan" items={task.freePlan} />
        <ListSection title="Paid Efficient Plan" items={task.paidPlan} />
        <ListSection title="Beginner Steps" items={task.beginnerSteps} />
        <section className="rounded-lg border bg-background p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangleIcon className="h-4 w-4 text-amber-500" />
            <h2 className="font-semibold">Pitfalls</h2>
          </div>
          <ul className="space-y-3 text-sm leading-relaxed">
            {task.pitfalls.map((pitfall) => (
              <li key={pitfall} className="flex gap-3">
                <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span>{pitfall}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-lg border bg-muted/30 p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-semibold">Alternative Tools</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/stack-builder">
              Build full stack
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {task.alternatives.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="rounded-md bg-background p-4 transition-colors hover:bg-muted"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground">{tool.role}</p>
                </div>
                <ExternalLinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}
