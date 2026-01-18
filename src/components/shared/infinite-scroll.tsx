"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface InfiniteScrollProps {
    onLoadMore: () => Promise<void>;
    hasMore: boolean;
    isLoading: boolean;
    autoLoadPageLimit?: number; // Number of pages to auto-load before showing button
}

export default function InfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading,
    autoLoadPageLimit = 3,
}: InfiniteScrollProps) {
    const observerTarget = useRef<HTMLDivElement>(null);
    const [loadedPagesCount, setLoadedPagesCount] = useState(1); // Start at 1 (initial page)
    const [shouldAutoLoad, setShouldAutoLoad] = useState(true);

    useEffect(() => {
        // Check if we've reached the auto-load limit
        if (loadedPagesCount >= autoLoadPageLimit) {
            setShouldAutoLoad(false);
        }
    }, [loadedPagesCount, autoLoadPageLimit]);

    useEffect(() => {
        if (!shouldAutoLoad || !hasMore || isLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    onLoadMore().then(() => {
                        setLoadedPagesCount((prev) => prev + 1);
                    });
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [onLoadMore, hasMore, isLoading, shouldAutoLoad]);

    if (!hasMore) {
        return null;
    }

    const handleLoadMoreClick = () => {
        onLoadMore().then(() => {
            setLoadedPagesCount((prev) => prev + 1);
        });
    };

    return (
        <div className="mt-8 flex items-center justify-center">
            {shouldAutoLoad ? (
                // Auto-load trigger (invisible)
                <div ref={observerTarget} className="h-10 w-full">
                    {isLoading && (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-sm text-muted-foreground">Loading...</span>
                        </div>
                    )}
                </div>
            ) : (
                // Manual load button
                <Button
                    onClick={handleLoadMoreClick}
                    disabled={isLoading}
                    variant="outline"
                    size="lg"
                    className="min-w-[200px]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                        </>
                    ) : (
                        "Load More"
                    )}
                </Button>
            )}
        </div>
    );
}
