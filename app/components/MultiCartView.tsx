"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { Cart } from "@prisma/client";
import {
  fetchCartItems,
  moveItem,
  selectCartItems,
  selectWishlistItems,
  deleteCartItem,
} from "@/app/store/features/cartSlice";
import { Button } from "@/app/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import type { CartItem } from "@/types/cart";
import { Trash, MoveRight, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { PriceChangeDisplay } from "./PriceChangeDisplay";
import { CartType } from "@prisma/client";
import { ItemType } from "@prisma/client";

interface CartItemComponentProps {
  item: CartItem;
  currentList: CartType;
  onMove: (to: CartType) => void;
  onDelete?: (id: string) => void;
  isLoading: boolean;
}

function CartItemComponent({
  item,
  currentList,
  onMove,
  onDelete,
  isLoading,
}: CartItemComponentProps) {
  console.log("Raw item data:", JSON.stringify(item, null, 2));

  const moveOptions: Record<CartType, CartType[]> = {
    CART: [CartType.WISHLIST],
    WISHLIST: [CartType.CART],
  } as const;

  return (
    <li className="flex items-center justify-between p-4 bg-card rounded-lg shadow">
      <div className="flex items-center space-x-4">
        {item.imageString && (
          <img
            src={item.imageString}
            alt={item.name}
            className="w-16 h-16 object-cover rounded"
          />
        )}
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-muted-foreground">By {item.creator}</p>
          <div className="flex items-center space-x-2">
            <span className="font-bold">${item.price}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {moveOptions[currentList].map((option) => (
          <Button
            key={option}
            variant="outline"
            size="sm"
            onClick={() => onMove(option as CartType)}
            disabled={isLoading}
          >
            <MoveRight className="w-4 h-4 mr-2" />
            {option.replace("_", " ")}
          </Button>
        ))}
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(item.id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </li>
  );
}

export function MultiCartView() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const wishlistItems = useAppSelector(selectWishlistItems);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "cart"; // Default to "cart" if no type is specified

  useEffect(() => {
    dispatch(fetchCartItems(CartType.CART));
    dispatch(fetchCartItems(CartType.WISHLIST));
  }, [dispatch]);

  const handleMoveItem = async (
    itemId: string,
    from: CartType,
    to: CartType
  ) => {
    try {
      await dispatch(
        moveItem({
          itemId,
          from,
          to,
        })
      ).unwrap();
      toast.success(`Item moved to ${to.toLowerCase()}`);
    } catch (error) {
      console.error("Move error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to move item"
      );
    }
  };

  const handleDelete = async (
    itemId: string,
    type: CartType,
    itemType: "PRESET" | "PACK" | "REQUEST"
  ) => {
    try {
      setDeletingId(itemId);
      await dispatch(deleteCartItem({ itemId, type, itemType })).unwrap();
      await dispatch(fetchCartItems(type));
      toast.success("Item removed");
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTabChange = (value: string) => {
    router.push(`/cart?type=${value}`);
  };

  return (
    <Tabs
      defaultValue={type}
      className="w-full max-w-4xl mx-auto"
      onValueChange={handleTabChange}
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="cart">Cart ({cartItems.length})</TabsTrigger>
        <TabsTrigger value="wishlist">
          Wishlist ({wishlistItems.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cart">
        <ul className="space-y-4">
          {cartItems.map((item: CartItem) => (
            <CartItemComponent
              key={item.id}
              item={item}
              currentList={CartType.CART}
              onMove={(to) => handleMoveItem(item.id, CartType.CART, to)}
              onDelete={(id) => handleDelete(id, CartType.CART, item.itemType)}
              isLoading={false}
            />
          ))}
        </ul>
      </TabsContent>

      <TabsContent value="wishlist">
        <ul className="space-y-4">
          {wishlistItems.map((item: CartItem) => (
            <CartItemComponent
              key={item.id}
              item={item}
              currentList={CartType.WISHLIST}
              onMove={(to) => handleMoveItem(item.id, CartType.WISHLIST, to)}
              onDelete={(id) =>
                handleDelete(id, CartType.WISHLIST, item.itemType)
              }
              isLoading={deletingId === item.id}
            />
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  );
}
