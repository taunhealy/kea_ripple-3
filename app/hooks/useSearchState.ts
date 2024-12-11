import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchFilters } from "@/types/SearchTypes";
import { DEFAULT_FILTERS } from "@/utils/filterUtils";

export function useSearchState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Parse search params into filters
  const getFiltersFromParams = (): SearchFilters => {
    const filters = { ...DEFAULT_FILTERS };

    for (const [key, value] of searchParams.entries()) {
      if (Array.isArray(filters[key as keyof SearchFilters])) {
        (filters[key as keyof SearchFilters] as string[]) = value.split(",");
      } else if (value) {
        (filters[key as keyof SearchFilters] as string) = value;
      }
    }

    return filters;
  };

  // Update URL and invalidate queries
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([key, value]) => {
      // Remove empty or default values
      if (
        !value ||
        value === "" ||
        (Array.isArray(value) && value.length === 0) ||
        value === DEFAULT_FILTERS[key as keyof SearchFilters]
      ) {
        params.delete(key);
      }
      // Only add non-empty, non-default values
      else {
        params.set(
          key,
          Array.isArray(value) ? value.filter(Boolean).join(",") : String(value)
        );
      }
    });

    // Clean up the URL by removing empty parameters
    const cleanParams = new URLSearchParams();
    for (const [key, value] of params.entries()) {
      if (value && value !== "") {
        cleanParams.set(key, value);
      }
    }

    router.push(`?${cleanParams.toString()}`, { scroll: false });
    queryClient.invalidateQueries({ queryKey: ["search"] });
  };

  return {
    filters: getFiltersFromParams(),
    updateFilters,
  };
}
