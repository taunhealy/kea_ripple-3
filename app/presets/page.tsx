"use client";

import { ContentExplorer } from "@/app/components/ContentExplorer";
import { ItemType } from "@prisma/client";
import { useSearchParams, useRouter } from "next/navigation";
import { DEFAULT_FILTERS } from "@/utils/filterUtils";
import { SearchFilters } from "@/types/SearchTypes";
import { PresetType, PriceType } from "@prisma/client";
import { ContentViewMode } from "@/types/enums";

export default function PresetsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Clean up URL if it contains 'type' parameter
  if (searchParams.has('type')) {
    const newParams = new URLSearchParams(searchParams);
    const view = newParams.get('type') === 'downloaded' ? ContentViewMode.DOWNLOADED : ContentViewMode.UPLOADED;
    newParams.delete('type');
    newParams.set('view', view);
    router.replace(`/presets?${newParams.toString()}`);
    return null;
  }

  // If vstTypes is 'all', convert it to empty array for the filters
  const vstTypes = searchParams.get("vstTypes");
  const processedVstTypes = vstTypes === 'all' ? [] : (vstTypes?.split(",") || []);

  const initialFilters: SearchFilters = {
    ...DEFAULT_FILTERS,
    searchTerm: searchParams.get("searchTerm") || "",
    presetTypes: (searchParams.get("presetTypes")?.split(",") as PresetType[]) || [],
    genres: searchParams.get("genres")?.split(",") || [],
    vstTypes: processedVstTypes,
    priceTypes: (searchParams.get("priceTypes")?.split(",") as PriceType[]) || [],
    page: parseInt(searchParams.get("page") || "1"),
    itemType: (searchParams.get("itemType")?.toUpperCase() as ItemType) || ItemType.PRESET,
    view: (searchParams.get("view") as ContentViewMode) || ContentViewMode.EXPLORE,
  };

  return (
    <ContentExplorer
      itemType={ItemType.PRESET}
      initialFilters={{
        ...initialFilters,
        itemType: ItemType.PRESET,
      }}
    />
  );
}
