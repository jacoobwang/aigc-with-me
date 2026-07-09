import Container from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { taskPlans } from "@/data/tasks";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export const metadata = constructMetadata({
  title: "AI Task Navigator",
  description:
    "Find the right AI tools by task, including recommended tool combinations, free plans, paid plans, beginner steps, alternatives, and pitfalls.",
  canonicalUrl: `${siteConfig.url}/tasks`,
});

export default function TasksPage() {
  return (
    <Container className="my-12 flex flex-col gap-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
          AI Task Navigator
        </p>
        <h1 className="mt-3 text-3xl font-bold text-balance md:text-5xl">
          Start from the task, then pick the tools.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Each task guide shows a recommended tool combination, a free path, a
          paid efficient path, beginner steps, alternatives, and pitfalls.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {taskPlans.map((task) => {
          const Icon = task.icon;
          return (
            <Link
              key={task.slug}
              href={`/tasks/${task.slug}`}
              className="group flex min-h-[260px] flex-col justify-between rounded-lg border bg-background p-5 transition-colors hover:bg-muted/40"
            >
              <div>
                <div className="mb-4 inline-flex rounded-md bg-indigo-500/10 p-2 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">{task.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {task.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {task.audience.slice(0, 3).map((person) => (
                    <Badge key={person} variant="secondary">
                      {person}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center text-sm font-semibold text-indigo-600">
                Open guide
                <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="rounded-lg border bg-muted/30 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Need a personal stack?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the Stack Builder when you want recommendations across
              multiple task types.
            </p>
          </div>
          <Button asChild>
            <Link href="/stack-builder">Build AI Stack</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
