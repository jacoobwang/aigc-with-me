"use client";

import { urlForIcon, urlForImage } from "@/lib/image";
import { cn } from "@/lib/utils";
import type { ItemInfo } from "@/types";
import { HashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

type ItemCard2Props = {
  item: ItemInfo;
};

/**
 * ItemCard2 shows item icon
 */
export default function ItemCard2({ item }: ItemCard2Props) {
  const iconProps = item?.icon ? urlForIcon(item.icon) : null;
  const imageProps = item?.image ? urlForImage(item.image) : null;
  const itemUrlPrefix = "/item";

  return (
    <div
      className={cn(
        "border rounded-lg flex flex-col justify-between",
        "duration-300 shadow-sm hover:shadow-md transition-shadow",
        item.featured
          ? "border-orange-300 border-spacing-1.5 bg-orange-50/50 dark:bg-orange-950/10 hover:bg-orange-50 dark:hover:bg-accent/60"
          : "hover:bg-accent/60 transition-colors duration-300",
      )}
    >
      {/* top */}
      <div className="flex flex-col gap-4">
        {/* preview image - full width */}
        {imageProps && (
          <Image
            src={imageProps.src}
            alt={item.image?.alt || `Preview image for ${item.name}`}
            title={item.image?.alt || `Preview image for ${item.name}`}
            width={imageProps.width}
            height={imageProps.height}
            className="w-full h-auto object-cover rounded-t-md"
            placeholder="blur"
            blurDataURL={item.image?.blurDataURL}
          />
        )}

        {/* icon + name */}
        <div className="flex w-full items-center gap-4 px-2">
          {iconProps && (
            <Image
              src={iconProps?.src}
              alt={item.icon.alt || `icon of ${item.name}`}
              title={item.icon.alt || `icon of ${item.name}`}
              width={32}
              height={32}
              className="object-cover image-scale rounded-md shrink-0"
            />
          )}

          <Link href={`${itemUrlPrefix}/${item.slug.current}`} className="min-w-0 flex-1">
            <h3
              className={cn(
                "text-xl font-medium truncate overflow-hidden text-ellipsis",
                item.featured && "text-gradient_indigo-purple font-semibold",
              )}
            >
              {item.name}
            </h3>
          </Link>
        </div>

        {/* min-h-[4.5rem] is used for making sure height of the card is the same */}
        <Link
          href={`${itemUrlPrefix}/${item.slug.current}`}
          className="block cursor-pointer px-2"
        >
          <p className="text-sm line-clamp-2 leading-relaxed min-h-[3rem]">
            {item.description}
          </p>
        </Link>

        {/* categories */}
        <div className="flex flex-col gap-2 px-2">
          {item.categories && item.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {item.categories.map((category, index) => (
                <a
                  key={category._id}
                  href={`/category/${category.slug.current}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "px-2 py-1 h-6 rounded-md",
                  )}
                >
                  <span className="text-sm text-muted-foreground">
                    {category.name}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* bottom */}
      <div className="mt-4 flex justify-end items-center">
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            {item.tags.slice(0, 5).map((tag, index) => (
              <Link
                key={tag._id}
                href={`/tag/${tag.slug.current}`}
                className="flex items-center justify-center space-x-0.5 group"
              >
                <HashIcon className="w-3 h-3 text-muted-foreground icon-scale" />
                <span className="text-sm text-muted-foreground link-underline">
                  {tag.name}
                </span>
              </Link>
            ))}
            {item.tags.length > 5 && (
              <span className="text-sm text-muted-foreground px-1">
                +{item.tags.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ItemCard2Skeleton() {
  return (
    <div className="border rounded-lg flex flex-col justify-between p-6">
      {/* top */}
      <div className="flex flex-col gap-4">
        {/* icon + name */}
        <div className="flex w-full items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-7 w-48" />
        </div>

        {/* categories */}
        <div className="flex flex-wrap gap-2 items-center">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>

        {/* description */}
        <Skeleton className="h-[4.5rem] w-full" />
      </div>

      {/* bottom */}
      <div className="mt-4 flex justify-end items-center">
        <div className="flex flex-wrap gap-2 items-center">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </div>
  );
}
