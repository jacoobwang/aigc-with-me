import { Button } from "@/components/ui/button";
import { heroConfig } from "@/config/hero";
import {
  AwardIcon,
  ExternalLinkIcon,
  LayersIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";
import HomeSearchBox from "./home-search-box";

export default function HomeHero() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="max-w-5xl flex flex-col items-center text-center gap-8">
        <Link
          href="https://beecrawl.dev"
          target="_blank"
          rel="noreferrer"
          aria-label="Sponsored by BeeCrawl"
          className="inline-flex items-center gap-4 rounded-3xl bg-muted/60 px-6 py-5 text-muted-foreground transition-colors hover:bg-muted sm:px-7 sm:py-6"
        >
          <AwardIcon
            className="size-8 shrink-0 text-primary"
            strokeWidth={2.5}
          />
          <span className="text-xl sm:text-2xl">Sponsored by</span>
          <span className="text-xl text-primary sm:text-2xl">BeeCrawl</span>
          <ExternalLinkIcon className="size-5 shrink-0 text-primary sm:size-6" />
        </Link>

        {/* maybe font-sourceSans is better */}
        <h1 className="max-w-5xl font-bold text-balance text-3xl sm:text-4xl md:text-5xl">
          {heroConfig.title.first}{" "}
          <span className="font-bold text-black dark:text-foreground">
            {heroConfig.title.second}
          </span>
        </h1>

        <p className="max-w-4xl text-balance text-muted-foreground sm:text-xl">
          {heroConfig.subtitle}
        </p>

        <div className="w-full">
          <HomeSearchBox urlPrefix="/" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/stack-builder">
              <LayersIcon className="mr-2 h-4 w-4" />
              Build AI Stack
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/tasks">
              <SearchIcon className="mr-2 h-4 w-4" />
              Browse by Task
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
