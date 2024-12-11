"use client";

import { ContentExplorer } from "@/app/components/ContentExplorer";
import { ItemType } from "@prisma/client";
import { Suspense } from "react";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ContentExplorer itemType={ItemType.PRESET} initialFilters={{}} />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[200px] w-full" />
    </div>
  );
}
