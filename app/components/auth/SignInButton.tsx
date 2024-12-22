"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";

export function SignInButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/auth/signin");
  };

  return <Button onClick={handleClick}>Sign in</Button>;
}
