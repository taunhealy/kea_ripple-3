import { ItemType, PriceType } from "@prisma/client";

export interface PresetGridProps {
  presets: any[];
  type: string;
  isLoading: boolean;
  userId?: string;
  filters: {
    searchTerm: string;
    genres: string[];
    vsts: string[];
    presetTypes: string[];
    tags: string[];
    category: string;
    showAll: boolean;
    types: string[];
    priceTypes: PriceType[];
    itemType: ItemType;
  };
}
