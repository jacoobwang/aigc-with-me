import Container from "@/components/container";
import { ChoiceGrid } from "@/components/seo/choice-grid";
import { Button } from "@/components/ui/button";
import { comparisonPages, getComparisonPage } from "@/data/seo-pages";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return comparisonPages.map((page) => ({ slug: page.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata | undefined {
  const page = getComparisonPage(params.slug);
  if (!page) return;

  return constructMetadata({
    title: page.title,
    description: page.description,
    canonicalUrl: `${siteConfig.url}/compare/${page.slug}`,
  });
}

export default function ComparePage({
  params,
}: {
  params: { slug: string };
}) {
  const page = getComparisonPage(params.slug);
  if (!page) return notFound();

  return (
    <Container className="my-12 flex flex-col gap-8">
      <Button asChild variant="ghost" className="w-fit px-0">
        <Link href="/compare">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to comparisons
        </Link>
      </Button>

      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
          Comparison Guide
        </p>
        <h1 className="mt-3 text-3xl font-bold text-balance md:text-5xl">
          {page.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {page.summary}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {[page.left, page.right].map((tool) => (
          <Link
            key={tool.name}
            href={tool.href}
            className="group rounded-lg border bg-background p-5 transition-colors hover:bg-muted/40"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold">{tool.name}</h2>
              <ArrowRightIcon className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
            <p className="mt-4 text-sm leading-relaxed">{tool.bestFor}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {tool.tradeoff}
            </p>
          </Link>
        ))}
      </section>

      <ChoiceGrid choices={page.choices} />
    </Container>
  );
}
