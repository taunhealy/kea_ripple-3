import { Inter } from "next/font/google";
import { SidebarProvider } from "@/app/components/ui/sidebar/sidebar-provider";
import { SidebarTrigger } from "./components/ui/sidebar/sidebar-trigger";
import { Providers } from "./components/Providers";
import { Toaster } from "sonner";

import "@/app/globals.css";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

// Dynamic imports for larger components
const AppSidebar = dynamic(
  () =>
    import("./components/ui/sidebar/app-sidebar").then((mod) => mod.AppSidebar),
  {
    ssr: false,
  }
);

const Navbar = dynamic(() => import("./components/Navbar"), {
  ssr: true,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex flex-1">
              <SidebarProvider>
                <AppSidebar />
                <main className="flex-1 p-4">
                  <SidebarTrigger />
                  {children}
                </main>
              </SidebarProvider>
            </div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
