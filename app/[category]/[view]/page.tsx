"use client";

import { ContentExplorer } from "@/app/components/ContentExplorer";
import { ItemType } from "@prisma/client";
import { useParams, notFound } from "next/navigation";

type CategoryParams = {
  category: string;
  view: string;
};

export default function CategoryPage() {
  const params = useParams<CategoryParams>();
  const category = params.category;

  // Simple category mapping using ITEM_TYPES
  const itemType = {
    presets: ItemType.PRESET,
    packs: ItemType.PACK,
    requests: ItemType.REQUEST,
  }[category];

  if (!itemType) notFound();

  return <ContentExplorer itemType={itemType} initialFilters={{}} />;
}
