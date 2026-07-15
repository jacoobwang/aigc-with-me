import { Icons } from "@/components/icons/icons";
import { buttonVariants } from "@/components/ui/button";
import { heroConfig } from "@/config/hero";
import { cn } from "@/lib/utils";
import Link from "next/link";
import HomeSearchBox from "./home3-search-box";
import { SponsorItemListQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { sponsorItemListQuery } from "@/sanity/lib/queries";
import SponsorItemCard from "../item/item-card-sponsor";

export default async function HomeHeroSponsor() {
  const LabelIcon = Icons[heroConfig.label.icon];
  
  // this code shows how to show sponsor item in the hero section
  const sponsorItems = (await sanityFetch<SponsorItemListQueryResult>({
    query: sponsorItemListQuery,
  })) || [];
  const sponsorItem = sponsorItems?.length
    ? sponsorItems[Math.floor(Math.random() * sponsorItems.length)]
    : null;
  
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full flex flex-col lg:flex-row items-center lg:items-start gap-6">
      <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-6">
        <Link
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
        </Link>

        {/* maybe font-sourceSans is better */}
        <h1 className="font-bold text-balance text-2xl sm:text-3xl md:text-4xl">
          {heroConfig.title.first}{" "}
          <span className="font-bold text-black dark:text-foreground">
            {heroConfig.title.second}
          </span>
        </h1>

        <p className="max-w-3xl text-balance text-muted-foreground sm:text-xl">
          {heroConfig.subtitle}
        </p>

        <div className="w-full flex items-center justify-center lg:justify-start">
          <HomeSearchBox urlPrefix="/home3" />
        </div>
      </div>

        {/* Sponsor card with fixed width */}
        {sponsorItem && (
          <div className="w-full lg:w-[400px]">
            <SponsorItemCard item={sponsorItem} />
          </div>
        )}
      </div>
    </div>
  );
}
