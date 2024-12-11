import { useQuery } from "@tanstack/react-query";
import { Genre } from "@prisma/client";

export function useGenres() {
  return useQuery<Genre[]>({
    queryKey: ["genres"],
    queryFn: async () => {
      const response = await fetch("/api/genres");
      if (!response.ok) {
        throw new Error("Failed to fetch genres");
      }
      return response.json();
    },
  });
}
