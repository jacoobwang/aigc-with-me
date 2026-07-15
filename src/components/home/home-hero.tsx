import { Icons } from "@/components/icons/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { heroConfig } from "@/config/hero";
import { cn } from "@/lib/utils";
import { LayersIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import HomeSearchBox from "./home-search-box";

export default function HomeHero() {
  const LabelIcon = Icons[heroConfig.label.icon];
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="max-w-5xl flex flex-col items-center text-center gap-8">
        {/* <Link
          href={heroConfig.label.href}
          target="_blank"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "px-4 rounded-full",
          )}
        >
          <span className="mr-2">🎉</span>
          <span>{heroConfig.label.text}</span>
          <LabelIcon className="size-4" />
        </Link> */}

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
