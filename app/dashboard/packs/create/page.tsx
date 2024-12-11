"use client";

import { PresetPackForm } from "@/app/components/dashboard/PresetPackForm";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default function CreatePackPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/dashboard?category=packs">
        <Button variant="outline">← Back to Packs</Button>
      </Link>
      <h1 className="text-2xl font-bold my-4">Create New Preset Pack</h1>
      <PresetPackForm />
    </div>
  );
}
