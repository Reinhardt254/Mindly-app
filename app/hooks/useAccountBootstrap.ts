import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useCustomAffirmations, useMe, useDailyAffirmation, queryKeys } from "@/hooks/useApi";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { notificationService } from "@/services/notificationService";
import { useSession } from "@/lib/auth-client";
import { hasPremium, identifyPurchaser, resetPurchaser } from "@/lib/purchases";
import { importLocalDataOnce } from "@/lib/sync";
import { updateWidget } from "@/lib/widget";
import { usePremiumStore } from "@/stores/premiumStore";

/** Wires the signed-in user into RevenueCat, the premium store, local-data import and the widget. */
export function useAccountBootstrap() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const qc = useQueryClient();
  const me = useMe(!!userId);
  const daily = useDailyAffirmation();
  const custom = useCustomAffirmations(!!userId);
  const { userProfile } = useLocalStorage();
  const lastCustomSignature = useRef<string | null>(null);
  const { setStorePremium, setServerPremium, reset } = usePremiumStore();

  useEffect(() => {
    if (!userId) {
      reset();
      resetPurchaser();
      qc.clear();
      return;
    }
    let cancelled = false;
    identifyPurchaser(userId, (info) => setStorePremium(hasPremium(info)))
      .then((info) => !cancelled && info && setStorePremium(hasPremium(info)))
      .catch((e) => console.warn("RevenueCat init failed", e));

    importLocalDataOnce(userId)
      .then(() => {
        qc.invalidateQueries({ queryKey: queryKeys.favorites });
        qc.invalidateQueries({ queryKey: queryKeys.custom });
        qc.invalidateQueries({ queryKey: queryKeys.me });
      })
      .catch((e) => console.warn("Local data import failed", e));

    return () => {
      cancelled = true;
    };
  }, [userId, qc, reset, setStorePremium]);

  useEffect(() => {
    if (me.data) setServerPremium(me.data.isPremium || me.data.role === "ADMIN");
  }, [me.data, setServerPremium]);

  useEffect(() => {
    if (!custom.data || !userProfile) return;
    const enabled = custom.data.items.filter((c) => c.isEnabled).map((c) => ({ id: c.id, text: c.text }));
    const signature = enabled.map((c) => c.id).join(",");
    notificationService.setCustomAffirmations(enabled);
    if (signature === lastCustomSignature.current) return;
    const firstLoad = lastCustomSignature.current === null;
    lastCustomSignature.current = signature;
    if (firstLoad && enabled.length === 0) return;
    notificationService
      .refreshIfScheduled({
        frequency: userProfile.affirmationFrequency,
        startHour: userProfile.reminderStartHour || 8,
        endHour: userProfile.reminderEndHour || 20,
      })
      .catch((e) => console.warn("Reminder refresh failed", e));
  }, [custom.data, userProfile]);

  useEffect(() => {
    if (!daily.data) return;
    updateWidget({ text: daily.data.text, streak: me.data?.streak.currentStreak ?? 0 });
  }, [daily.data, me.data?.streak.currentStreak]);
}
