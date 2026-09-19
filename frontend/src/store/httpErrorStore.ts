import { create } from "zustand";

export type HttpErrorKind = "forbidden" | "not_found" | "internal_server_error" | "network_error" | null;

interface HttpErrorState {
  kind: HttpErrorKind;
  statusCode: number | null;
  actions: {
    setError: (kind: Exclude<HttpErrorKind, null>, statusCode?: number | null) => void;
    clearError: () => void;
  };
}

export const useHttpErrorStore = create<HttpErrorState>()((set) => ({
  kind: null,
  statusCode: null,
  actions: {
    setError: (kind, statusCode = null) => set({ kind, statusCode }),
    clearError: () => set({ kind: null, statusCode: null }),
  },
}));

export const useHttpErrorActions = () => useHttpErrorStore((state) => state.actions);
