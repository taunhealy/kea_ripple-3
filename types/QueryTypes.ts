import { PriceType, ContentType, PresetType } from "@prisma/client";

export interface QueryConfig {
  staleTime?: number;
  cacheTime?: number;
  retry?: boolean | number;
  refetchOnWindowFocus?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FilterParams {
  searchTerm?: string;
  genres?: string[];
  vsts?: string[];
  presetTypes?: PresetType[];
  priceTypes?: PriceType[];
  showAll?: boolean;
}

export interface QueryParams extends FilterParams {
  type: "uploaded" | "downloaded";
  contentType: ContentType;
}
