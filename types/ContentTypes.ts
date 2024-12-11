import { ItemType } from "@prisma/client";
import { SearchFilters } from "./SearchTypes";
import { ContentViewMode } from "./enums";
export interface ContentListingParams {
  viewMode: ContentViewMode;
  itemType: ItemType;
  filters?: SearchFilters;
}
