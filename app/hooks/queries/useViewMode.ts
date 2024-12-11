import { ContentViewMode } from "@/types/enums";
import { RequestViewMode } from "@/types/enums";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useViewMode() {
  return useQuery({
    queryKey: ["viewMode"],
    // Query will always return immediately since we're not fetching
    staleTime: Infinity,
  });
}

export function useSetViewMode() {
  const queryClient = useQueryClient();

  return (viewMode: ContentViewMode | RequestViewMode) => {
    queryClient.setQueryData(["viewMode"], viewMode);
  };
}
