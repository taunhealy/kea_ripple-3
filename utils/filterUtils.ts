import { SearchFilters } from "@/types/SearchTypes";
import { ContentViewMode } from "@/types/enums";
import { ItemType } from "@prisma/client";

export const DEFAULT_FILTERS: SearchFilters = {
  searchTerm: "",
  itemType: "PRESET" as ItemType,
  view: ContentViewMode.EXPLORE,
  priceTypes: [],
  genres: [],
  vstTypes: [],
  presetTypes: [],
  tags: [],
  showAll: false,
  page: 1,
  pageSize: 20,
  categories: [],
  sort: "createdAt",
  order: "desc",
};

export function updateFilter<K extends keyof SearchFilters>(
  filters: SearchFilters,
  key: K,
  value: SearchFilters[K]
): SearchFilters {
  return {
    ...filters,
    [key]: value,
  };
}

export function toggleArrayFilter<T>(
  currentValues: T[],
  value: T,
  checked: boolean
): T[] {
  if (checked) {
    return [...currentValues, value];
  }
  return currentValues.filter((v) => v !== value);
}
