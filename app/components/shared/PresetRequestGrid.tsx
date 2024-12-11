"use client";

import { PresetRequestCard } from "@/app/components/PresetRequestCard";
import { Skeleton } from "@/app/components/ui/skeleton";
import { ContentViewMode, RequestStatus, RequestViewMode } from "@/types/enums";
import { PresetRequestWithRelations } from "@/types/PresetRequestTypes";
import { Button } from "@/app/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react"; // Import PlusIcon or any other icon you prefer

interface PresetRequestGridProps {
  requests?: PresetRequestWithRelations[];
  isLoading: boolean;
  requestViewMode: RequestViewMode;
}

export function PresetRequestGrid({
  requests,
  requestViewMode,
  isLoading,
}: PresetRequestGridProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!requests?.length) {
    return <EmptyState requestViewMode={requestViewMode} />;
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {requests.map((request) => (
        <PresetRequestCard
          key={request.id}
          request={request}
          requestViewMode={RequestViewMode.PUBLIC}
        />
      ))}
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} className="h-[200px] w-full" />
    ))}
  </div>
);
function EmptyState({ requestViewMode }: { requestViewMode: RequestViewMode }) {
  return (
    <div className="text-center py-10">
      <p className="text-muted-foreground">
        {requestViewMode === RequestViewMode.REQUESTED
          ? "You haven't requested any presets yet"
          : "No requests found"}
      </p>
      {requestViewMode === RequestViewMode.REQUESTED && (
        <Link href="/requests/create" className="mt-4 inline-block">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Request
          </Button>
        </Link>
      )}
    </div>
  );
}
