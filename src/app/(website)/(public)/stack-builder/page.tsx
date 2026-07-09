import Container from "@/components/container";
import { StackBuilder } from "@/components/stack-builder/stack-builder";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";

export const metadata = constructMetadata({
  title: "AI Stack Builder",
  description:
    "Build a personal AI tool stack from your role, budget, platform, use case, and preferences.",
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
          Choose your identity, budget, platform, tasks, and preferences. The
          builder returns a focused stack across chat, research, image, video,
          automation, and coding tools.
        </p>
      </div>

      <StackBuilder />
    </Container>
  );
}
