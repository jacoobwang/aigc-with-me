import EmptyGrid from "@/components/shared/empty-grid";
import { siteConfig } from "@/config/site";
import { getItems } from "@/data/item";
import {
  DEFAULT_SORT,
  ITEMS_PER_PAGE,
  SORT_FILTER_LIST,
} from "@/lib/constants";
import { constructMetadata } from "@/lib/metadata";
import type { SponsorItemListQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { sponsorItemListQuery } from "@/sanity/lib/queries";
import HomeContentClient from "./home-content-client";

export const metadata = constructMetadata({
  title: "",
  canonicalUrl: `${siteConfig.url}/`,
});

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  console.log("HomePage, searchParams", searchParams);

  const sponsorItems = (await sanityFetch<SponsorItemListQueryResult>({
    query: sponsorItemListQuery,
  })) || [];
  const showSponsor = true;
  const hasSponsorItem = showSponsor && sponsorItems.length > 0;

  const {
    category,
    tag,
    sort,
    q: query,
    f: filter,
  } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    SORT_FILTER_LIST.find((item) => item.slug === sort) || DEFAULT_SORT;

  // Always load page 1 for initial render
  const { items, totalCount } = await getItems({
    category,
    tag,
    sortKey,
    reverse,
    query,
    filter,
    currentPage: 1,
    hasSponsorItem,
  });

  console.log("HomePage, totalCount", totalCount);

  return (
    <div>
      {/* when no items are found */}
      {items?.length === 0 && <EmptyGrid />}

      {/* when items are found */}
      {items && items.length > 0 && (
        <HomeContentClient
          initialItems={items}
          sponsorItems={sponsorItems}
          showSponsor={showSponsor}
          totalCount={totalCount}
        />
      )}
    </div>
  );
}
