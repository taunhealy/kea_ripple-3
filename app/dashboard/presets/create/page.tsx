"use client";

import { PresetForm } from "@/app/components/dashboard/PresetForm";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { useSession } from "next-auth/react";

export default function CreatePresetPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return <div>Please sign in to create presets</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard?category=presets">
        <Button variant="outline">← Back to Presets</Button>
      </Link>
      <h1 className="text-2xl font-bold my-4">Create New Preset</h1>
      <PresetForm initialData={null} />
    </div>
  );
}
