import { ItemType, PriceType, PresetType, VstType } from "@prisma/client";
import { ContentViewMode, RequestViewMode } from "./enums";

export interface SearchFilters {
  searchTerm?: string;
  itemType?: ItemType;
  view?: ContentViewMode | RequestViewMode;
  priceTypes?: string[];
  genres?: string[];
  vstTypes?: string[];
  presetTypes?: string[];
  tags?: string[];
  showAll?: boolean;
  page?: number;
  pageSize?: number;
  categories?: string[];
  sort?: string;
  order?: "asc" | "desc";
  status?: string;
}

export interface SearchFilterUpdate {
  filterKey: keyof SearchFilters;
  value: SearchFilters[keyof SearchFilters];
}

export interface SearchSidebarProps {
  filters: SearchFilters;
  setFilters: (
    filters: SearchFilters | ((prev: SearchFilters) => SearchFilters)
  ) => void;
}

export interface SearchSidebarState {
  filters: SearchFilters;
  setFilters: (
    filters: SearchFilters | ((prev: SearchFilters) => SearchFilters)
  ) => void;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}
