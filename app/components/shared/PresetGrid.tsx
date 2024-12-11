"use client";

import { PresetCard } from "@/app/components/PresetCard";
import { Skeleton } from "@/app/components/ui/skeleton";
import { ContentViewMode } from "@/types/enums";
import { PresetUpload } from "@prisma/client";
import { CreatePresetButton } from "@/app/components/CreatePresetButton";

interface PresetGridProps {
  presets?: PresetUpload[];
  contentViewMode: ContentViewMode;
  isLoading: boolean;
  view?: string | null;
}

export function PresetGrid({
  presets,
  contentViewMode,
  isLoading,
  view,
}: PresetGridProps) {
  console.log("[DEBUG] PresetGrid props:", {
    presetsLength: presets?.length,
    firstPreset: presets?.[0],
    contentViewMode,
  });

  const content = (() => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    if (!presets?.length) {
      return (
        <EmptyState
          contentViewMode={contentViewMode}
          showUploadButton={contentViewMode === ContentViewMode.UPLOADED}
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            contentViewMode={contentViewMode}
          />
        ))}
      </div>
    );
  })();

  return <div>{content}</div>;
}

const LoadingSkeleton = () => (
  <>
    <Skeleton className="h-[200px] w-full" />
    <Skeleton className="h-[200px] w-full" />
    <Skeleton className="h-[200px] w-full" />
  </>
);

const EmptyState = ({
  contentViewMode,
  showUploadButton,
}: {
  contentViewMode: ContentViewMode;
  showUploadButton: boolean;
}) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <p className="text-muted-foreground mb-4">
      {contentViewMode === ContentViewMode.UPLOADED
        ? "You haven't uploaded any presets yet"
        : contentViewMode === ContentViewMode.DOWNLOADED
        ? "You haven't downloaded any presets yet"
        : "No presets found"}
    </p>
    {showUploadButton && <CreatePresetButton />}
  </div>
);
