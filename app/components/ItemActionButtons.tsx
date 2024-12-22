"use client";

import { ActionButton } from "./ui/action-button";
import {
  ShoppingCartIcon,
  HeartIcon,
  TrashIcon,
  EditIcon,
  Loader2Icon,
  PlayIcon,
  PauseIcon,
  DownloadIcon,
} from "lucide-react";
import { useItemActions } from "@/app/hooks/useItemActions";
import { ItemActionButtonsProps } from "@/types/actions";
import { ItemType } from "@prisma/client";
import { useAudioPlayer } from "@/app/hooks/useAudioPlayer";
import { toast } from "react-hot-toast";

export function ItemActionButtons({
  itemId,
  itemType,
  isOwner,
  isDownloaded,
  onDelete,
  onEdit,
}: ItemActionButtonsProps) {
  const {
    isDeleting,
    isAddingToCart,
    isAddingToWishlist,
    handleDelete,
    handleAddToCart,
    handleAddToWishlist,
  } = useItemActions({
    itemId,
    itemType,
  });

  // Add error handling for audio player
  const { isPlaying, activeTrack, play, pause } = useAudioPlayer({
    onError: (error) => {
      console.error("Audio playback error:", error);
      toast.error("Failed to play audio");
    }
  });
  
  const isCurrentlyPlaying = isPlaying && activeTrack === itemId;

  // Show download button if user owns or has downloaded the item
  if (isOwner || isDownloaded) {
    return (
      <div className="flex gap-2">
        <ActionButton variant="download" size="icon" className="h-8 w-8">
          <DownloadIcon className="h-4 w-4" />
        </ActionButton>
        {isOwner && (
          <div className="flex gap-2">
            <ActionButton variant="edit" size="icon" className="h-8 w-8" onClick={onEdit}>
              <EditIcon className="h-4 w-4" />
            </ActionButton>
            <ActionButton variant="delete" size="icon" className="h-8 w-8" onClick={handleDelete}>
              {isDeleting ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <TrashIcon className="h-4 w-4" />
              )}
            </ActionButton>
          </div>
        )}
      </div>
    );
  }

  // Show cart/wishlist buttons for non-owned/non-downloaded items
  return (
    <div className="flex items-center gap-2">
      <ActionButton
        variant="play"
        size="icon"
        className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
        onClick={() => play(itemId, itemType)}
      >
        {isCurrentlyPlaying ? (
          <PauseIcon className="h-4 w-4" />
        ) : (
          <PlayIcon className="h-4 w-4" />
        )}
      </ActionButton>
      <ActionButton
        variant="cart"
        size="icon"
        className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
        onClick={() => handleAddToCart()}
        disabled={isAddingToCart}
      >
        {isAddingToCart ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCartIcon className="h-4 w-4" />
        )}
      </ActionButton>
      <ActionButton
        variant="wishlist"
        size="icon"
        className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
        onClick={() => handleAddToWishlist()}
        disabled={isAddingToWishlist}
      >
        {isAddingToWishlist ? (
          <Loader2Icon className="h-4 w-4 animate-spin" />
        ) : (
          <HeartIcon className="h-4 w-4" />
        )}
      </ActionButton>
    </div>
  );
}
