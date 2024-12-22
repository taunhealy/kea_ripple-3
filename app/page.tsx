"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ContentViewMode } from "@/types/enums";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to presets with Explore view and All VSTs selected
    router.replace("/presets?view=explore&vstTypes=all");
  }, [router]);

  return null; // Return null since we're redirecting
}
