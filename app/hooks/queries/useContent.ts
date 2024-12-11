import { useQuery } from "@tanstack/react-query";
import { ItemType } from "@prisma/client";
import { SearchFilters } from "@/types/SearchTypes";

export function useContent({
  itemType,
  filters,
}: {
  itemType: ItemType;
  filters: SearchFilters;
}) {
  return useQuery({
    queryKey: ["content", itemType, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("itemType", itemType);

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== "itemType") {
          console.log(`Adding param: ${key} = ${value}`);
          params.append(key, String(value));
        }
      });

      const finalUrl = `/api/search?${params.toString()}`;
      console.log("Final URL:", finalUrl);

      const response = await fetch(finalUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch content");
      }
      return response.json();
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
