"use client";

import { PresetPackCard } from "@/app/components/PresetPackCard";
import { Skeleton } from "@/app/components/ui/skeleton";
import { ContentViewMode } from "@/types/enums";
import { PresetPackWithRelations } from "@/types/presetPack";
import { Button } from "@/app/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

interface PresetPackGridProps {
  packs: any[];
  contentViewMode: ContentViewMode;
  isLoading: boolean;
  buttonVariants?: {
    edit: string;
    delete: string;
    download: string;
  };
}

export function PresetPackGrid({
  packs,
  contentViewMode,
  isLoading,
  buttonVariants,
}: PresetPackGridProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!packs?.length) {
    return (
      <EmptyState
        contentViewMode={contentViewMode}
        showCreateButton={contentViewMode === ContentViewMode.UPLOADED}
      />
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {packs.map((pack) => (
        <PresetPackCard
          key={pack.id}
          pack={pack}
          contentViewMode={contentViewMode}
        />
      ))}
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {[...Array(6)].map((_, i) => (
      <Skeleton key={i} className="h-[400px] w-full" />
    ))}
  </div>
);

const EmptyState = ({
  contentViewMode,
  showCreateButton,
}: {
  contentViewMode: ContentViewMode;
  showCreateButton: boolean;
}) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <p className="text-muted-foreground mb-4">
      {contentViewMode === ContentViewMode.UPLOADED
        ? "You haven't uploaded any preset packs yet"
        : contentViewMode === ContentViewMode.DOWNLOADED
        ? "You haven't downloaded any preset packs yet"
        : "No preset packs found"}
    </p>
    {showCreateButton && (
      <Link href="/dashboard/packs/create">
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Pack
        </Button>
      </Link>
    )}
  </div>
);
