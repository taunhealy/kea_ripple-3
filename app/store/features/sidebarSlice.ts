import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface SidebarSettings {
  disabled: boolean;
  isHoverOpen: boolean;
}

interface SidebarState {
  isOpen: boolean;
  isHover: boolean;
  settings: SidebarSettings;
}

const initialState: SidebarState = {
  isOpen: true,
  isHover: false,
  settings: {
    disabled: false,
    isHoverOpen: false,
  },
};

export const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleOpen: (state) => {
      state.isOpen = !state.isOpen;
    },
    setIsOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    setIsHover: (state, action: PayloadAction<boolean>) => {
      state.isHover = action.payload;
    },
    updateSettings: (
      state,
      action: PayloadAction<Partial<SidebarSettings>>
    ) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
});

// Actions
export const { toggleOpen, setIsOpen, setIsHover, updateSettings } =
  sidebarSlice.actions;

// Selectors
export const selectSidebarState = (state: RootState) => ({
  ...state.sidebar,
  isEffectivelyOpen:
    state.sidebar.isOpen ||
    (state.sidebar.settings.isHoverOpen && state.sidebar.isHover),
});

export default sidebarSlice.reducer;
