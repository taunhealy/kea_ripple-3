// app/hooks/usePresetSearch.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { SearchFilters } from "@/types/SearchTypes";
import { useRouter, useSearchParams } from "next/navigation";

export function usePresetSearch(initialFilters: SearchFilters) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sync filters with URL
  const updateSearchParams = (filters: SearchFilters, newPage?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update params with filter values
    if (filters.itemType) params.set("itemType", filters.itemType.toString());
    if (filters.searchTerm) params.set("searchTerm", filters.searchTerm);
    if (filters.view) params.set("view", filters.view.toString());
    if (filters.genres?.length) params.set("genres", filters.genres.join(","));
    if (filters.presetTypes?.length) params.set("presetTypes", filters.presetTypes.join(","));
    if (filters.vstTypes?.length) params.set("vstTypes", filters.vstTypes.join(","));
    if (filters.priceTypes?.length) params.set("priceTypes", filters.priceTypes.join(","));
    if (newPage) params.set("page", newPage.toString());

    // Remove empty params
    Array.from(params.entries()).forEach(([key, value]) => {
      if (!value) params.delete(key);
    });

    router.push(`?${params.toString()}`, { scroll: false });
  };

  return useInfiniteQuery({
    queryKey: ["content", initialFilters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams();
      
      // Add all filter parameters
      if (initialFilters.itemType) params.set("itemType", initialFilters.itemType.toString());
      if (initialFilters.searchTerm) params.set("searchTerm", initialFilters.searchTerm);
      if (initialFilters.view) params.set("view", initialFilters.view.toString());
      if (initialFilters.genres?.length) {
        params.set("genres", initialFilters.genres.join(","));
      }
      if (initialFilters.presetTypes?.length) {
        params.set("presetTypes", initialFilters.presetTypes.join(","));
      }
      if (initialFilters.vstTypes?.length) {
        params.set("vstTypes", initialFilters.vstTypes.join(","));
      }
      if (initialFilters.priceTypes?.length) {
        params.set("priceTypes", initialFilters.priceTypes.join(","));
      }
      
      params.set("page", pageParam.toString());
      params.set("pageSize", "20");

      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch presets");
      }
      const data = await response.json();
      
      // Update URL when fetching new page
      updateSearchParams(initialFilters, pageParam);
      
      return data;
    },
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.currentPage + 1 : undefined,
    initialPageParam: parseInt(searchParams.get("page") || "1"),
  });
}
