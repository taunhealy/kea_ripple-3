// app/requests/page.tsx
"use client";

import { ContentExplorer } from "@/app/components/ContentExplorer";
import { ItemType } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import { DEFAULT_FILTERS } from "@/utils/filterUtils";
import { SearchFilters } from "@/types/SearchTypes";
import { RequestViewMode, RequestStatus } from "@/types/enums";

export default function RequestsPage() {
  const searchParams = useSearchParams();

  const initialFilters: SearchFilters = {
    ...DEFAULT_FILTERS,
    searchTerm: searchParams.get("searchTerm") || "",
    genres: searchParams.get("genres")?.split(",") || [],
    status: searchParams.get("status") || RequestStatus.OPEN,
    page: parseInt(searchParams.get("page") || "1"),
    itemType: ItemType.REQUEST,
    view:
      (searchParams.get("view") as RequestViewMode) || RequestViewMode.PUBLIC,
  };

  return (
    <ContentExplorer
      itemType={ItemType.REQUEST}
      initialFilters={initialFilters}
    />
  );
}
