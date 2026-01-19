import { ItemCardSkeleton } from "@/components/item/item-card";
import { ITEMS_PER_PAGE, SUPPORT_ITEM_ICON } from "@/lib/constants";
import type { ItemListQueryResult, SponsorItemListQueryResult } from "@/sanity.types";
import { ItemCard2Skeleton } from "./item-card-2";
import ItemGridClient from "./item-grid-client";

interface ItemGridProps {
  items: ItemListQueryResult;
  sponsorItems: SponsorItemListQueryResult;
  showSponsor?: boolean;
}

/**
 * ItemGrid Server Component
 *
 * 1. show sponsor item card when item.sponsor is true
 * 2. show item card with icon when SUPPORT_ITEM_ICON is true
 * otherwise show item card with image
 */
export default async function ItemGrid({ items, sponsorItems, showSponsor = true }: ItemGridProps) {
  if (!showSponsor) {
    return <ItemGridClient items={items} />;
  }

  // show sponsor items at the top
  // const allItems = [...(Array.isArray(sponsorItems) ? sponsorItems : []), ...items];

  // show sponsor item in the 3rd item
  const allItems = [
    ...items.slice(0, 2),
    ...(Array.isArray(sponsorItems) && sponsorItems.length > 0 ? [sponsorItems[0]] : []),
    ...items.slice(2)
  ];

  return <ItemGridClient items={allItems} />;
}

export function ItemGridSkeleton({
  count = ITEMS_PER_PAGE,
}: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {[...Array(count)].map((_, index) =>
        SUPPORT_ITEM_ICON ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: ignore
          <ItemCard2Skeleton key={index} />
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: ignore
          <ItemCardSkeleton key={index} />
        ),
      )}
    </div>
  );
}
