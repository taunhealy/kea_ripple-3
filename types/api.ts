import { PresetUpload, PresetPackUpload, PresetRequest } from "@prisma/client";

// Base response type for all API responses
export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  error?: {
    code: string;
    details?: unknown;
  };
} & ({ success: true; items: T[] } | { success: false; items?: never });

// Pagination metadata
export type PaginationMeta = {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
