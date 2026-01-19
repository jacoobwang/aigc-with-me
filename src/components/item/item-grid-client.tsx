import ItemCard from "@/components/item/item-card";
import { SUPPORT_ITEM_ICON } from "@/lib/constants";
import { checkValidSponsor } from "@/lib/utils";
import type { ItemListQueryResult } from "@/sanity.types";
import ItemCard2 from "./item-card-2";
import SponsorItemCard from "./item-card-sponsor";

interface ItemGridClientProps {
  items: ItemListQueryResult;
}

/**
 * ItemGrid Client Component
 *
 * 1. show sponsor item card when item.sponsor is true
 * 2. show item card with icon when SUPPORT_ITEM_ICON is true
 * otherwise show item card with image
 */
export default function ItemGridClient({ items }: ItemGridClientProps) {
  return (
    <div>
      {items && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item) =>
            checkValidSponsor(item) ? (
              <SponsorItemCard key={item._id} item={item} />
            ) : SUPPORT_ITEM_ICON ? (
              <ItemCard2 key={item._id} item={item} />
            ) : (
              <ItemCard key={item._id} item={item} />
            ),
          )}
        </div>
      )}
    </div>
  );
}
