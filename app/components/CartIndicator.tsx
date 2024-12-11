"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import {
  selectCartItems,
  selectWishlistItems,
  fetchCartItems,
} from "@/app/store/features/cartSlice";
import { ShoppingCartIcon, HeartIcon } from "lucide-react";
import Link from "next/link";
import { useAuthRedirect } from "@/app/hooks/useAuthRedirect";

type CartType = "cart" | "wishlist";

export function CartIndicator() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const wishlistItems = useAppSelector(selectWishlistItems);
  const { status } = useAuthRedirect();

  useEffect(() => {
    if (status === "authenticated") {
      dispatch(fetchCartItems("CART"));
      dispatch(fetchCartItems("WISHLIST"));
    }
  }, [dispatch, status]);

  return (
    <div className="flex items-center gap-4">
      <Link href="/cart?type=wishlist" className="relative">
        <HeartIcon className="h-6 w-6" />
        {wishlistItems?.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
            {wishlistItems.length}
          </span>
        )}
      </Link>
      <Link href="/cart" className="relative">
        <ShoppingCartIcon className="h-6 w-6" />
        {cartItems?.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
            {cartItems.length}
          </span>
        )}
      </Link>
    </div>
  );
}
