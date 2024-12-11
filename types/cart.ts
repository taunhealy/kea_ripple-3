import { CartType, ItemType } from "@prisma/client";
import { SearchFilters } from "./SearchTypes";

export interface CartState {
  [CartType.CART]: {
    items: CartItem[];
    status: "idle" | "loading" | "failed";
    error: string | null;
  };
  [CartType.WISHLIST]: {
    items: CartItem[];
    status: "idle" | "loading" | "failed";
    error: string | null;
  };
  loading: {
    [key: string]: boolean;
  };
}

export interface ItemsState {
  presets: any[];
  packs: any[];
  requests: any[];
  loading: {
    [key: string]: boolean;
  };
}

export type RootState = {
  cart: CartState;
  filters: SearchFilters;
  items: ItemsState;
};

export type CartStatus = "idle" | "loading" | "failed";

export type WishlistStatus = "idle" | "loading" | "failed";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageString: string;
  quantity: number;
  creator: string;
  itemType: ItemType;
  createdAt: string;
  updatedAt: string;
  cartId: string;
  presetId: string | null;
  packId: string | null;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  priceChanges?: {
    presetId: string;
    oldPrice: number;
    newPrice: number;
    percentageChange: number;
  }[];
}

export interface WishlistItem extends CartItem {
  presetId: string;
}

export const initialState: CartState = {
  [CartType.CART]: {
    items: [],
    status: "idle",
    error: null,
  },
  [CartType.WISHLIST]: {
    items: [],
    status: "idle",
    error: null,
  },
  loading: {},
};

export type CartOperationType = "ADD" | "MOVE" | "REMOVE";

export interface CartOperation {
  itemId: string;
  type: CartOperationType;
  from?: CartType;
  to?: CartType;
  itemType: ItemType;
}

export interface CartApiResponse {
  success: boolean;
  data: CartItem[];
  error?: string;
}
