import { useQuery, useQueryClient } from "@tanstack/react-query";

const ITEMS_PER_PAGE = 9;

export function usePresetPagination(page: number) {
  const queryClient = useQueryClient();

  // Fetch current page and prefetch next page
  const { data, isLoading, error } = useQuery({
    queryKey: ["presets", page],
    queryFn: async () => {
      const response = await fetch(
        `/api/presets?page=${page}&limit=${ITEMS_PER_PAGE}`
      );
      if (!response.ok) throw new Error("Failed to fetch presets");
      return response.json();
    },
    placeholderData: () => {
      // Use the previous page's data as placeholder if available
      return queryClient.getQueryData(["presets", page - 1]);
    },
    // This will automatically prefetch the next page
    staleTime: 1000 * 60, // Keep data fresh for 1 minute
  });

  // Prefetch next page
  queryClient.prefetchQuery({
    queryKey: ["presets", page + 1],
    queryFn: async () => {
      const response = await fetch(
        `/api/presets?page=${page + 1}&limit=${ITEMS_PER_PAGE}`
      );
      if (!response.ok) throw new Error("Failed to fetch presets");
      return response.json();
    },
  });

  return { data, isLoading, error };
}
