import ItemCard, { ItemCardSkeleton } from "@/components/item/item-card";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { ItemListQueryResult } from "@/sanity.types";

interface ItemGrid2Props {
  items: ItemListQueryResult;
}

/**
 * ItemGrid2 component
 *
 * show item card with image only
 */
export default function ItemGrid2({ items }: ItemGrid2Props) {
  return (
    <div>
      {items && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ItemGridSkeleton({
  count = ITEMS_PER_PAGE,
}: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {[...Array(count)].map((_, index) =>
        // biome-ignore lint/suspicious/noArrayIndexKey: ignore
        <ItemCardSkeleton key={index} />
      )}
    </div>
  );
}
