"use client";

import { Button } from "@/app/components/ui/button";
import { useSidebar } from "@/app/hooks/useSidebar";
import { MenuIcon } from "lucide-react";

export function SidebarTrigger() {
  const { toggleOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      onClick={() => toggleOpen()}
    >
      <MenuIcon className="h-6 w-6" />
    </Button>
  );
}
