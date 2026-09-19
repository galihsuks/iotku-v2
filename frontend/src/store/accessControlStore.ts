import { create } from "zustand";

export type AccessCode = "C" | "R" | "U" | "D" | string;
export type HasAccess = (code: AccessCode) => boolean;

interface AccessControlState {
  currentMenuId: string | null;
  codes: string[];
  actions: {
    setAccessContext: (menuId: string | null, codes: string[]) => void;
    clearAccessContext: () => void;
  };
}

export const useAccessControlStore = create<AccessControlState>()((set) => ({
  currentMenuId: null,
  codes: [],
  actions: {
    setAccessContext: (menuId, codes) =>
      set({
        currentMenuId: menuId,
        codes: Array.from(new Set(codes)),
      }),
    clearAccessContext: () =>
      set({
        currentMenuId: null,
        codes: [],
      }),
  },
}));

export const useAccessControlActions = () => useAccessControlStore((state) => state.actions);
export const useAccessControlCodes = () => useAccessControlStore((state) => state.codes);
export const useHasAccess = () => {
  const codes = useAccessControlCodes();

  const hasAccess: HasAccess = (code) => codes.includes(code);

  return hasAccess;
};
