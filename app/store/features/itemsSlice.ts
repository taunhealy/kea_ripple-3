import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ItemType } from "@prisma/client";

interface ItemsState {
  presets: any[];
  packs: any[];
  requests: any[];
  loading: {
    [key: string]: boolean;
  };
}

const initialState: ItemsState = {
  presets: [],
  packs: [],
  requests: [],
  loading: {},
};

export const deleteItem = createAsyncThunk(
  "items/delete",
  async ({ itemId, itemType }: { itemId: string; itemType: ItemType }) => {
    const endpoint = (() => {
      switch (itemType.toLowerCase()) {
        case "preset":
          return "/api/presets";
        case "pack":
          return "/api/preset-packs";
        case "request":
          return "/api/requests";
        default:
          throw new Error(`Unknown item type: ${itemType}`);
      }
    })();

    const response = await fetch(`${endpoint}/${itemId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to delete ${itemType}`);
    }

    return { itemId, itemType };
  }
);

export const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(deleteItem.pending, (state, action) => {
        const { itemId } = action.meta.arg;
        state.loading[itemId] = true;
      })
      .addCase(deleteItem.fulfilled, (state, action) => {
        const { itemId, itemType } = action.payload;
        const itemTypeKey = `${itemType.toLowerCase()}s` as keyof typeof state;

        // Remove the item from the appropriate array
        (state[itemTypeKey] as any[]) = (state[itemTypeKey] as any[]).filter(
          (item: any) => item.id !== itemId
        );

        // Clear loading state
        delete state.loading[itemId];
      })
      .addCase(deleteItem.rejected, (state, action) => {
        const { itemId } = action.meta.arg;
        delete state.loading[itemId];
      });
  },
});

export default itemsSlice.reducer;
