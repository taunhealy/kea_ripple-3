"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { ItemType } from "@prisma/client";
import { ContentViewMode, RequestViewMode } from "@/types/enums";

interface CategoryTabsProps {
  selectedItemType: ItemType;
  onSelect?: (itemType: ItemType) => void;
}

interface TabItem {
  value: ItemType;
  label: string;
  defaultView: ContentViewMode | RequestViewMode;
}

const TAB_ITEMS: TabItem[] = [
  {
    value: ItemType.PRESET,
    label: "Presets",
    defaultView: ContentViewMode.EXPLORE,
  },
  {
    value: ItemType.PACK,
    label: "Packs",
    defaultView: ContentViewMode.EXPLORE,
  },
  {
    value: ItemType.REQUEST,
    label: "Requests",
    defaultView: RequestViewMode.PUBLIC,
  },
];

export function CategoryTabs({
  selectedItemType,
  onSelect,
}: CategoryTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentView = searchParams?.get("view");

  const getDefaultView = (itemType: ItemType): string => {
    return itemType === ItemType.REQUEST
      ? RequestViewMode.REQUESTED
      : ContentViewMode.UPLOADED;
  };

  const handleTabChange = (itemType: ItemType) => {
    const view = currentView || getDefaultView(itemType);
    if (onSelect) {
      onSelect(itemType);
    }
    router.push(`/${itemType.toLowerCase()}s?view=${view}`);
  };

  return (
    <Tabs value={selectedItemType.toLowerCase()} className="mb-4">
      <TabsList>
        {TAB_ITEMS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value.toLowerCase()}
            onClick={() => handleTabChange(tab.value)}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
