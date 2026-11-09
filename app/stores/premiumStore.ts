import { useMe } from "@/hooks/useApi";
import { PREMIUM_ENABLED } from "@/lib/config";
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

/** RevenueCat, the API premium flag, or an admin role. When PREMIUM_ENABLED is false, everyone is premium. */
export const useIsPremium = () => {
  const storePremium = usePremiumStore((s) => s.isPremium);
  const me = useMe();
  return (
    !PREMIUM_ENABLED ||
    storePremium ||
    me.data?.isPremium === true ||
    me.data?.role === "ADMIN"
  );
};
