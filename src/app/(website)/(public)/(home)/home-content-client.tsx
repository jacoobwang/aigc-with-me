"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ItemGrid from "@/components/item/item-grid-client";
import EmptyGrid from "@/components/shared/empty-grid";
import InfiniteScroll from "@/components/shared/infinite-scroll";
import type { ItemListQueryResult, SponsorItemListQueryResult } from "@/sanity.types";
import { fetchMoreItems } from "./item-actions";
import { ITEMS_PER_PAGE } from "@/lib/constants";

interface HomeContentClientProps {
    initialItems: ItemListQueryResult;
    sponsorItems: SponsorItemListQueryResult;
    showSponsor: boolean;
    totalCount: number;
}

export default function HomeContentClient({
    initialItems,
    sponsorItems,
    showSponsor,
    totalCount,
}: HomeContentClientProps) {
    const searchParams = useSearchParams();
    const [items, setItems] = useState(initialItems);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const category = searchParams.get("category") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const sort = searchParams.get("sort") || undefined;
    const query = searchParams.get("q") || undefined;
    const filter = searchParams.get("f") || undefined;

    const hasSponsorItem = showSponsor && sponsorItems.length > 0;
    const itemsPerPage = hasSponsorItem ? ITEMS_PER_PAGE - 1 : ITEMS_PER_PAGE;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const hasMore = currentPage < totalPages;

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        try {
            const nextPage = currentPage + 1;
            const result = await fetchMoreItems({
                category,
                tag,
                sort,
                page: nextPage,
                query,
                filter,
            });

            if (result.items.length > 0) {
                setItems((prevItems) => [...prevItems, ...result.items]);
                setCurrentPage(nextPage);
            }
        } catch (error) {
            console.error("Error loading more items:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, hasMore, isLoading, category, tag, sort, query, filter]);

    // Prepare all items with sponsor item inserted at position 3
    const allItems = showSponsor && sponsorItems.length > 0
        ? [
            ...items.slice(0, 2),
            ...(Array.isArray(sponsorItems) && sponsorItems.length > 0 ? [sponsorItems[0]] : []),
            ...items.slice(2),
        ]
        : items;

    if (items.length === 0) {
        return <EmptyGrid />;
    }

    return (
        <section className="">
            <ItemGrid items={allItems} />

            <InfiniteScroll
                onLoadMore={loadMore}
                hasMore={hasMore}
                isLoading={isLoading}
                autoLoadPageLimit={3}
            />
        </section>
    );
}
