import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  presets: {
    all: ["presets"] as const,
    lists: () => [...queryKeys.presets.all, "list"] as const,
    list: (filters: string) => [...queryKeys.presets.lists(), filters] as const,
    details: () => [...queryKeys.presets.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.presets.details(), id] as const,
  },
  packs: {
    all: ["packs"] as const,
    lists: () => [...queryKeys.packs.all, "list"] as const,
    list: (filters: string) => [...queryKeys.packs.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.packs.all, id] as const,
  },
  user: {
    purchases: (userId: string) => ["users", userId, "purchases"] as const,
    uploads: (userId: string) => ["users", userId, "uploads"] as const,
  },
};
