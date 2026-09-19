import { create } from "zustand";

interface LayoutState {
  collapseDesktopSidebar: boolean;
  actions: {
    setCollapseDesktopSidebar: (value: boolean) => void;
    toggleCollapseDesktopSidebar: () => void;
  };
}

export const useLayoutStore = create<LayoutState>()((set) => ({
  collapseDesktopSidebar: false,
  actions: {
    setCollapseDesktopSidebar: (value) => set({ collapseDesktopSidebar: value }),
    toggleCollapseDesktopSidebar: () =>
      set((state) => ({ collapseDesktopSidebar: !state.collapseDesktopSidebar })),
  },
}));

export const useCollapseDesktopSidebar = () =>
  useLayoutStore((state) => state.collapseDesktopSidebar);

export const useLayoutActions = () => useLayoutStore((state) => state.actions);
