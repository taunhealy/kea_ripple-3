"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/app/store/store";
import { useState } from "react";
import dynamic from "next/dynamic";

const ReactQueryDevTools = dynamic(
  () =>
    import("@tanstack/react-query-devtools").then((d) => d.ReactQueryDevtools),
  {
    ssr: false,
    loading: () => null,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <ReduxProvider store={store}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          {process.env.NODE_ENV === "development" && (
            <ReactQueryDevTools
              initialIsOpen={false}
              buttonPosition="bottom-right"
            />
          )}
        </QueryClientProvider>
      </SessionProvider>
    </ReduxProvider>
  );
}
