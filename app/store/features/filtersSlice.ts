import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SearchFilters } from "@/types/SearchTypes";
import { ItemType } from "@prisma/client";
import { ContentViewMode } from "@/types/enums";

const initialState: SearchFilters = {
  searchTerm: "",
  priceTypes: [],
  genres: [],
  vstTypes: [],
  presetTypes: [],
  tags: [],
  showAll: false,
  categories: [],
  page: 1,
  pageSize: 20,
  itemType: ItemType.PRESET,
  view: ContentViewMode.EXPLORE,
  sort: "",
  order: "asc",
};

export const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    updateFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      return { ...state, ...action.payload };
    },
    clearAllFilters: () => initialState,
  },
});

export const { updateFilters, clearAllFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
