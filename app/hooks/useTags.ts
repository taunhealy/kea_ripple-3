import { useQuery } from "@tanstack/react-query";
import { ItemType } from "@prisma/client";

export function useTags(type: ItemType) {
  return useQuery({
    queryKey: ["tags", type],
    queryFn: async () => {
      const response = await fetch(`/api/tags?type=${type}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }
      return response.json();
    },
  });
}