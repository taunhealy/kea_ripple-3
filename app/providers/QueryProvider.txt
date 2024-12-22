"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import DevTools with no SSR
const ReactQueryDevTools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then((d) => d.ReactQueryDevtools),
  {
    ssr: false,
    loading: () => null,
  }
);

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevTools />}
    </QueryClientProvider>
  );
}
