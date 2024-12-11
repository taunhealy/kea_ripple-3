"use client";

import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Upload } from "lucide-react";

export function UploadPresetButton() {
  return (
    <Link href="/dashboard/presets/create">
      <Button
        variant="default"
        size="default"
        className="flex items-center gap-2 font-medium hover:opacity-90 transition-opacity"
      >
        <Upload className="w-4 h-4" />
        <span>Upload Preset</span>
      </Button>
    </Link>
  );
}
