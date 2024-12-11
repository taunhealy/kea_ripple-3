"use client";

import { ContentExplorer } from "@/app/components/ContentExplorer";
import { ContentViewMode } from "@/types/enums";
import { ItemType } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import { DEFAULT_FILTERS } from "@/utils/filterUtils";
import { SearchFilters } from "@/types/SearchTypes";

export default function PacksPage() {
  const searchParams = useSearchParams();

  const initialFilters: SearchFilters = {
    ...DEFAULT_FILTERS,
    searchTerm: searchParams.get("searchTerm") || "",
    genres: searchParams.get("genres")?.split(",") || [],
    page: parseInt(searchParams.get("page") || "1"),
    itemType: ItemType.PACK,
    view:
      (searchParams.get("view") as ContentViewMode) || ContentViewMode.EXPLORE,
  };

  return (
    <ContentExplorer
      itemType={ItemType.PACK}
      initialFilters={initialFilters}
    />
  );
}
