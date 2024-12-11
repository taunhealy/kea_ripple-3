import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarContent({ className, ...props }: SidebarContentProps) {
  return (
    <div
      className={cn("flex flex-col gap-4 p-4 h-full overflow-auto", className)}
      {...props}
    />
  );
}