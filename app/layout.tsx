import { Inter } from "next/font/google";
import { Providers } from "./components/Providers";
import { Toaster } from "sonner";
import { NotificationBell } from "@/components/notifications/NotificationBell";

import "@/app/globals.css";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

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
              {children}
            </div>
          </div>
          <Toaster />
          <NotificationBell />
        </Providers>
      </body>
    </html>
  );
}
