import Container from "@/components/container";
import { StackBuilder } from "@/components/stack-builder/stack-builder";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "AI Stack Builder",
  description:
    "Describe your workflow and get an AI-planned tool stack matched with tools from the directory.",
  canonicalUrl: `${siteConfig.url}/stack-builder`,
});

export default function StackBuilderPage() {
  return (
    <Container className="my-12 flex flex-col gap-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
          AI Stack Builder
        </p>
        <h1 className="mt-3 text-3xl font-bold text-balance md:text-5xl">
          Build a practical AI tool stack for your work.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Describe your role, budget, platform, tasks, and constraints. The
          builder analyzes your request, infers a focused stack, and matches it
          with tools already in the directory.
        </p>
      </div>

      <StackBuilder />
    </Container>
  );
}
