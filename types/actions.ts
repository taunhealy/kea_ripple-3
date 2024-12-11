import { ContentViewMode, RequestViewMode } from "./enums";
import { ItemType } from "@prisma/client";

export interface ItemActionButtonsProps {
  itemId: string;
  itemType: ItemType;
  isOwner?: boolean;
  isDownloaded?: boolean;
  isDeleting?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
}

export interface UseItemActionsProps {
  itemId: string;
  itemType: ItemType;
  contentViewMode?: ContentViewMode;
  requestViewMode?: RequestViewMode;
}

export interface ItemActionsState {
  isDeleting: boolean;
  isAddingToCart: boolean;
  isAddingToWishlist: boolean;
  isMovingToCart: boolean;
  isEditing: boolean;
}

export interface UseItemActionsReturn {
  isDeleting: boolean;
  isAddingToCart: boolean;
  isAddingToWishlist: boolean;
  isMovingToCart: boolean;
  isEditing: boolean;
  handleDelete: () => Promise<void>;
  handleEdit: () => void;
  handleAddToCart: () => Promise<void>;
  handleAddToWishlist: () => Promise<void>;
}
