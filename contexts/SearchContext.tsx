import { createContext, useContext, useState, ReactNode } from "react";
import { SearchFilters } from "@/types/SearchTypes";
import { toggleArrayFilter } from "@/utils/filterUtils";
import { ItemType } from "@prisma/client";
import { ContentViewMode } from "@/types/enums";

const DEFAULT_FILTERS: SearchFilters = {
  searchTerm: "",
  itemType: ItemType.PRESET,
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

interface SearchContextType {
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  updateFilter: <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => void;
  toggleFilter: (
    key: keyof SearchFilters,
    value: string,
    checked: boolean
  ) => void;
  resetFilters: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFilter = (
    key: keyof SearchFilters,
    value: string,
    checked: boolean
  ) => {
    setFilters((prev) => {
      const currentValue = prev[key];
      if (!Array.isArray(currentValue)) return prev;

      return {
        ...prev,
        [key]: toggleArrayFilter(currentValue, value, checked),
      };
    });
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <SearchContext.Provider
      value={{
        filters,
        setFilters,
        updateFilter,
        toggleFilter,
        resetFilters,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within SearchProvider");
  }
  return context;
};
