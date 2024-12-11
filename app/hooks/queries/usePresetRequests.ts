import { useQuery } from "@tanstack/react-query";

interface FetchRequestsParams {
  view: string;
  userId: string;
  status: string;
}

export function usePresetRequests({
  view,
  userId,
  status,
}: FetchRequestsParams) {
  return useQuery({
    queryKey: ["presetRequests", view, userId, status],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        type: "requests",
        view,
        userId,
        status,
      });

      const response = await fetch(`/api/search?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }

      return response.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}
