"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/app/components/ui/button";

export function SignInButton() {
  const handleSignIn = async () => {
    try {
      await signIn("google");
    } catch (error) {
      console.error("💥 Sign-in error:", error);
    }
  };

  return <Button onClick={handleSignIn}>Sign in with Google</Button>;
}
