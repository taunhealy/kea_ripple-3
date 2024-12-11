"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { useSidebarContext } from "./sidebar-provider";
import {
  PackageIcon,
  Settings2Icon,
  BarChart3Icon,
  FileAudioIcon,
  MessagesSquareIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
  {
    title: "Presets",
    icon: FileAudioIcon,
    href: "/presets",
  },
  {
    title: "Packs",
    icon: PackageIcon,
    href: "/packs",
  },
  {
    title: "Requests",
    icon: MessagesSquareIcon,
    href: "/requests",
  },
  {
    title: "Stats",
    icon: BarChart3Icon,
    href: "/stats",
  },
  {
    title: "Settings",
    icon: Settings2Icon,
    href: "/settings",
  },
];

export function AppSidebar() {
  const { isOpen } = useSidebarContext();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r bg-background pt-16 transition-transform",
        isOpen && "translate-x-0"
      )}
    >
      <ScrollArea className="h-full px-4">
        <nav className="flex flex-col gap-2 py-4">
          {sidebarItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
