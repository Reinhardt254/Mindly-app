import { create } from "zustand";

interface PremiumState {
  /** Entitlement reported by the RevenueCat SDK on this device. */
  storePremium: boolean;
  /** Entitlement known to the API (source of truth for gated endpoints). */
  serverPremium: boolean;
  isPremium: boolean;
  setStorePremium: (value: boolean) => void;
  setServerPremium: (value: boolean) => void;
  reset: () => void;
}

export const usePremiumStore = create<PremiumState>((set) => ({
  storePremium: false,
  serverPremium: false,
  isPremium: false,
  setStorePremium: (storePremium) => set((s) => ({ storePremium, isPremium: storePremium || s.serverPremium })),
  setServerPremium: (serverPremium) => set((s) => ({ serverPremium, isPremium: serverPremium || s.storePremium })),
  reset: () => set({ storePremium: false, serverPremium: false, isPremium: false }),
}));

export const useIsPremium = () => usePremiumStore((s) => s.isPremium);
