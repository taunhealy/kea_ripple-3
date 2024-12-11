import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "@/app/store/features/cartSlice";
import filtersReducer from "@/app/store/features/filtersSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    filters: filtersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
