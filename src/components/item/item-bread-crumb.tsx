import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { ItemInfo } from "@/types";
import { HomeIcon } from "lucide-react";

interface ItemBreadCrumbProps {
  item: ItemInfo;
}

/**
 * breadcrumb for item
 */
export default function ItemBreadCrumb({ item }: ItemBreadCrumbProps) {
  return (
    <Breadcrumb className="text-base">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href={"/"}>
            <div className="flex items-center gap-1">
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </div>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium">{item?.name}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
