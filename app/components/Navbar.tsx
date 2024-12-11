"use client";

import { useSession } from "next-auth/react";
import { SignInButton } from "./auth/SignInButton";
import { SignOutButton } from "./auth/SignOutButton";
import { Link, UserIcon } from "lucide-react";
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

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b">
      <div className="container mx-auto flex items-center justify-between p-4">
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

        <div className="flex items-center gap-4">
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
