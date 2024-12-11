import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { deleteItem } from "@/app/store/features/itemsSlice";
import {
  addToCart as addToCartAction,
  optimisticAddToCart,
  fetchCartItems,
} from "@/app/store/features/cartSlice";
import { toast } from "react-hot-toast";
import { UseItemActionsProps, UseItemActionsReturn } from "@/types/actions";
import { CartItem, CartType, ItemType } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function useItemActions({
  itemId,
  itemType,
  contentViewMode,
}: UseItemActionsProps): UseItemActionsReturn {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isDeleting = useAppSelector((state) => state.items.loading[itemId]);

  // Consolidate state management
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const handleDelete = async () => {
    try {
      await dispatch(deleteItem({ itemId, itemType })).unwrap();
      toast.success(`${itemType.toLowerCase()} deleted successfully`);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to delete ${itemType.toLowerCase()}`
      );
    }
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      // Create temporary item for optimistic update with serialized dates
      const tempItem = {
        id: itemId,
        itemType,
        quantity: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cartId: "temp",
        presetId: itemType === "PRESET" ? itemId : null,
        packId: itemType === "PACK" ? itemId : null,
      };

      // Optimistic update
      dispatch(
        optimisticAddToCart({
          itemId,
          type: CartType.CART,
          item: tempItem as unknown as CartItem,
        })
      );

      // Actual API call
      await dispatch(
        addToCartAction({
          itemId,
          cartType: CartType.CART,
          itemType: itemType as "PRESET" | "PACK",
        })
      ).unwrap();

      // Refresh cart state
      await dispatch(fetchCartItems(CartType.CART));
      toast.success("Added to cart");
    } catch (error) {
      // Revert optimistic update
      await dispatch(fetchCartItems(CartType.CART));
      toast.error(
        error instanceof Error ? error.message : "Item already exists in cart"
      );
      throw error;
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    setIsAddingToWishlist(true);
    try {
      // Create temporary item for optimistic update
      const tempItem = {
        id: itemId,
        itemType,
        quantity: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        cartId: "temp",
        presetId: itemType === "PRESET" ? itemId : null,
        packId: itemType === "PACK" ? itemId : null,
      };

      // Optimistic update
      dispatch(
        optimisticAddToCart({
          itemId,
          type: CartType.WISHLIST,
          item: tempItem as unknown as CartItem,
        })
      );

      // Actual API call
      await dispatch(
        addToCartAction({
          itemId,
          cartType: CartType.WISHLIST,
          itemType: itemType as "PRESET" | "PACK",
        })
      ).unwrap();

      // Refresh wishlist state
      await dispatch(fetchCartItems(CartType.WISHLIST));
      toast.success("Added to wishlist");
    } catch (error) {
      // Revert optimistic update
      await dispatch(fetchCartItems(CartType.WISHLIST));
      toast.error(
        error instanceof Error
          ? error.message
          : "Item already exists in wishlist"
      );
      throw error;
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleEdit = () => {
    switch (itemType) {
      case ItemType.PRESET:
        router.push(`/dashboard/presets/edit/${itemId}`);
        break;
      case ItemType.PACK:
        router.push(`/dashboard/packs/edit/${itemId}`);
        break;
      case ItemType.REQUEST:
        router.push(`/dashboard/requests/edit/${itemId}`);
        break;
      default:
        console.error(`Unknown item type: ${itemType}`);
    }
  };

  return {
    isDeleting,
    isAddingToCart,
    isAddingToWishlist,
    handleDelete,
    handleEdit,
    handleAddToCart,
    handleAddToWishlist,
    isMovingToCart: false,
    isEditing: false,
  };
}
