import { ITEMS_PER_PAGE, SHOW_QUERY_LOGS } from "@/lib/constants";
import type { Item, ItemListQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { itemSimpleFields } from "@/sanity/lib/queries";
import { ItemInfo } from "@/types";

/**
 * get item by id
 */
export async function getItemById(id: string) {
  try {
    // @sanity-typegen-ignore
    const itemQry = `*[_type == "item" && _id == "${id}"][0]`;
    const item = await sanityFetch<Item>({
      query: itemQry,
      disableCache: true,
    });
    if (SHOW_QUERY_LOGS) {
      console.log("getItemById, item:", item);
    }
    return item;
  } catch (error) {
    console.error("getItemById, error:", error);
    return null;
  }
}

/**
 * get item info by id, with submitter info & images, etc.
 */
export async function getItemInfoById(id: string) {
  try {
    // @sanity-typegen-ignore
    const itemQry = `*[_type == "item" && _id == "${id}"][0] {
      ${itemSimpleFields}
    }`;
    const item = await sanityFetch<ItemInfo>({
      query: itemQry,
      disableCache: true,
    });
    if (SHOW_QUERY_LOGS) {
      console.log("getItemInfoById, item:", item);
    }
    return item;
  } catch (error) {
    console.error("getItemInfoById, error:", error);
    return null;
  }
}

/**
 * get items from sanity
 */
export async function getItems({
  collection,
  category,
  tag,
  sortKey,
  reverse,
  query,
  filter,
  currentPage,
  hasSponsorItem,
}: {
  collection?: string;
  category?: string;
  tag?: string;
  sortKey?: string;
  reverse?: boolean;
  query?: string;
  filter?: string;
  currentPage: number;
  hasSponsorItem?: boolean;
}) {
  console.log(
    "getItems, collection",
    collection,
    "category",
    category,
    "tag",
    tag,
    "hasSponsorItem",
    hasSponsorItem,
  );

  const itemsPerPage = hasSponsorItem ? ITEMS_PER_PAGE - 1 : ITEMS_PER_PAGE;
  // console.log("getItems, itemsPerPage", itemsPerPage);

  try {
    const { countQuery, dataQuery } = buildQuery(
      collection,
      category,
      tag,
      sortKey,
      reverse,
      query,
      filter,
      currentPage,
      itemsPerPage,
    );
    const [totalCount, items] = await Promise.all([
      sanityFetch<number>({ query: countQuery }),
      sanityFetch<ItemListQueryResult>({ query: dataQuery }),
    ]);
    return { items, totalCount };
  } catch (error) {
    console.error("getItems, error:", error);
    return { items: [], totalCount: 0 };
  }
}

/**
 * build count and data query for get items from sanity
 */
const buildQuery = (
  collection?: string,
  category?: string,
  tag?: string,
  sortKey?: string,
  reverse?: boolean,
  query?: string,
  filter?: string,
  currentPage = 1,
  itemsPerPage = ITEMS_PER_PAGE,
) => {
  const orderDirection = reverse ? "desc" : "asc";
  const sortOrder = sortKey
    ? `| order(coalesce(featured, false) desc, ${sortKey} ${orderDirection})`
    : "| order(coalesce(featured, false) desc, publishDate desc)";
  const queryPattern = query ? `*${query}*` : "";
  const queryKeywords = query
    ? `&& (name match "${queryPattern}" 
    || description match "${queryPattern}"
    || introduction match "${queryPattern}")`
    : "";
  const filterCondition = filter ? `&& ${filter}` : "";
  const queryCondition = [queryKeywords, filterCondition]
    .filter(Boolean)
    .join(" ");
  const collectionCondition = collection
    ? `&& "${collection}" in collections[]->slug.current`
    : "";
  const categoryCondition = category
    ? `&& "${category}" in categories[]->slug.current`
    : "";
  // condition for single tag
  // const tagCondition = tag ? `&& "${tag}" in tags[]->slug.current` : "";
  // condition for multiple tags
  // split tag by comma and check if each tag is in tags[]->slug.current
  const tagList = tag ? tag.split(",") : [];
  const tagCondition =
    tagList && tagList.length > 0
      ? `&& count((tags[]->slug.current)[@ in [${tagList.map((t) => `"${t}"`).join(", ")}]]) == ${tagList.length}`
      : "";
  const offsetStart = (currentPage - 1) * itemsPerPage;
  const offsetEnd = offsetStart + itemsPerPage;

  // @sanity-typegen-ignore
  const countQuery = `count(*[_type == "item" && defined(slug.current) 
      && defined(publishDate) && forceHidden != true && sponsor != true
      ${queryCondition} ${collectionCondition} ${categoryCondition} ${tagCondition}])`;
  // @sanity-typegen-ignore
  const dataQuery = `*[_type == "item" && defined(slug.current) 
      && defined(publishDate) && forceHidden != true && sponsor != true
      ${queryCondition} ${collectionCondition} ${categoryCondition} ${tagCondition}] ${sortOrder} 
      [${offsetStart}...${offsetEnd}] {
      ${itemSimpleFields}
    }`;
  // console.log('buildQuery, countQuery', countQuery);
  // console.log("buildQuery, dataQuery", dataQuery);
  return { countQuery, dataQuery };
};
