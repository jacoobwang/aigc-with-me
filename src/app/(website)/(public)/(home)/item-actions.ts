"use server";

import { getItems } from "@/data/item";
import { DEFAULT_SORT, SORT_FILTER_LIST } from "@/lib/constants";
import type { ItemListQueryResult, SponsorItemListQueryResult } from "@/sanity.types";
import { sanityFetch } from "@/sanity/lib/fetch";
import { sponsorItemListQuery } from "@/sanity/lib/queries";

export async function fetchMoreItems({
    category,
    tag,
    sort,
    page,
    query,
    filter,
}: {
    category?: string;
    tag?: string;
    sort?: string;
    page: number;
    query?: string;
    filter?: string;
}): Promise<{
    items: ItemListQueryResult;
    totalCount: number;
    hasMore: boolean;
}> {
    const { sortKey, reverse } =
        SORT_FILTER_LIST.find((item) => item.slug === sort) || DEFAULT_SORT;

    const sponsorItems = (await sanityFetch<SponsorItemListQueryResult>({
        query: sponsorItemListQuery,
    })) || [];

    const showSponsor = true;
    const hasSponsorItem = showSponsor && sponsorItems.length > 0;

    const { items, totalCount } = await getItems({
        category,
        tag,
        sortKey,
        reverse,
        query,
        filter,
        currentPage: page,
        hasSponsorItem,
    });

    return {
        items,
        totalCount,
        hasMore: items.length > 0,
    };
}
