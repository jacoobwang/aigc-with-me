import Container from "@/components/container";
import { comparisonPages } from "@/data/seo-pages";
import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/lib/metadata";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export const metadata = constructMetadata({
  title: "AI Tool Comparisons",
  description:
    "Compare AI tools by real workflow fit, pricing, team use, API needs, and tradeoffs.",
  canonicalUrl: `${siteConfig.url}/compare`,
});

export default function CompareIndexPage() {
  return (
    <Container className="my-12 flex flex-col gap-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
          Comparisons
        </p>
        <h1 className="mt-3 text-3xl font-bold text-balance md:text-5xl">
          Compare AI tools by the decision you need to make.
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {comparisonPages.map((page) => (
          <Link
            key={page.slug}
            href={`/compare/${page.slug}`}
            className="group rounded-lg border bg-background p-5 transition-colors hover:bg-muted/40"
          >
            <h2 className="text-xl font-semibold">{page.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {page.description}
            </p>
            <div className="mt-5 flex items-center text-sm font-semibold text-indigo-600">
              Open comparison
              <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
