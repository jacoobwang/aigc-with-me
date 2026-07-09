import Container from "@/components/container";
import { ChoiceGrid, ToolOptionGrid } from "@/components/seo/choice-grid";
import { Button } from "@/components/ui/button";
import {
  alternativesPages,
  getAlternativesPage,
} from "@/data/seo-pages";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";
import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return alternativesPages.map((page) => ({ slug: page.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata | undefined {
  const page = getAlternativesPage(params.slug);
  if (!page) return;

  return constructMetadata({
    title: page.title,
    description: page.description,
    canonicalUrl: `${siteConfig.url}/alternatives/${page.slug}`,
  });
}

export default function AlternativesPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = getAlternativesPage(params.slug);
  if (!page) return notFound();

  return (
    <Container className="my-12 flex flex-col gap-8">
      <Button asChild variant="ghost" className="w-fit px-0">
        <Link href="/alternatives">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to alternatives
        </Link>
      </Button>

      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
          Alternatives Guide
        </p>
        <h1 className="mt-3 text-3xl font-bold text-balance md:text-5xl">
          {page.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {page.intro}
        </p>
      </div>

      <ChoiceGrid choices={page.choices} />
      <ToolOptionGrid tools={page.tools} />
    </Container>
  );
}
