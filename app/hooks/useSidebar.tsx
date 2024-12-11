import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  toggleOpen,
  setIsOpen,
  setIsHover,
  updateSettings,
  selectSidebarState,
} from "@/app/store/features/sidebarSlice";
import type { SidebarSettings } from "@/types/sidebar";

export function useSidebar() {
  const dispatch = useAppDispatch();
  const sidebarState = useAppSelector(selectSidebarState);

  return {
    ...sidebarState,
    toggleOpen: () => dispatch(toggleOpen()),
    setIsOpen: (isOpen: boolean) => dispatch(setIsOpen(isOpen)),
    setIsHover: (isHover: boolean) => dispatch(setIsHover(isHover)),
    setSettings: (settings: Partial<SidebarSettings>) =>
      dispatch(updateSettings(settings)),
  };
}
