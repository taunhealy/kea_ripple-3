"use client";

import { useSession } from "next-auth/react";
import { SignInButton } from "./auth/SignInButton";
import { SignOutButton } from "./auth/SignOutButton";
import { UserIcon } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/components/ui/avatar";
import { CartIndicator } from "./CartIndicator";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { ItemType } from "@prisma/client";
import { ContentViewMode, RequestViewMode } from "@/types/enums";
import { SpotifyStatus } from "./SpotifyStatus";

const NAV_ITEMS = [
  {
    value: ItemType.PRESET,
    label: "Presets",
    href: "/presets",
    defaultView: ContentViewMode.EXPLORE,
  },
  {
    value: ItemType.PACK,
    label: "Packs",
    href: "/packs",
    defaultView: ContentViewMode.EXPLORE,
  },
  {
    value: ItemType.REQUEST,
    label: "Requests",
    href: "/requests",
    defaultView: RequestViewMode.PUBLIC,
  },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  return (
    <nav className="theme-transition border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bold">
            Ripple
          </Link>
          {status === "authenticated" && (
            <Link href="/dashboard" className="font-bold">
              Dashboard
            </Link>
          )}
        </div>

        {/* Center section - Navigation */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex space-x-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.value}
                href={`${item.href}?view=${item.defaultView}`}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname.startsWith(item.href)
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {status === "authenticated" && (
            <SpotifyStatus />
          )}
          {status === "authenticated" ? (
            <>
              <CartIndicator />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session?.user?.image || ""}
                        alt={session?.user?.name || ""}
                      />
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <SignOutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <SignInButton />
          )}
        </div>
      </div>
    </nav>
  );
}
