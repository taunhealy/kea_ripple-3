import { ContentViewMode, RequestViewMode } from "./enums";
import { PresetPackWithRelations } from "./presetPack";
import { PresetRequestWithRelations } from "./PresetRequestTypes";
import { PresetUpload, VST, Genre, User, ItemType } from "@prisma/client";

export interface ContentExplorerProps {
  itemType: ItemType;
  onViewChange?: (view: string) => void;
}

export interface ContentExplorerTabState {
  itemType: ItemType;
  activeTab: ContentViewMode | RequestViewMode;
  viewMode: string;
  status: string;
}

export interface PresetGridProps {
  presets?: (PresetUpload & {
    vst?: VST | null;
    genre?: Genre | null;
    user?: User | null;
  })[];
  contentViewMode: ContentViewMode;
  isLoading: boolean;
  view?: string | null;
  itemType?: ItemType;
}

export interface PresetPackGridProps {
  packs?: PresetPackWithRelations[];
  contentViewMode: ContentViewMode;
  isLoading: boolean;
  itemType?: ItemType;
}

export interface PresetRequestGridProps {
  requests?: PresetRequestWithRelations[];
  requestViewMode: RequestViewMode;
  isLoading: boolean;
  itemType?: ItemType;
}

export interface CategoryTabsProps {
  selectedItemType: ItemType;
  onSelect: (itemType: ItemType) => void;
}
