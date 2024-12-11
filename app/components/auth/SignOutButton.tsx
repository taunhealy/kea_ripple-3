"use client";

import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "@/app/components/ui/dropdown-menu";

export function SignOutButton() {
  const handleSignOut = async () => {
    console.log("🚪 Starting sign-out process...");
    try {
      await signOut({
        callbackUrl: "/",
        redirect: false,
      });
      console.log("👋 Sign-out successful!");
    } catch (error) {
      console.error("💥 Sign-out error:", error);
    }
  };

  return <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>;
}
