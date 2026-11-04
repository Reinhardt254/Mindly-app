import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStatsStore } from "@/stores/statsStore";
import { api } from "./api";

const key = (userId: string) => `@imported_local_data:${userId}`;

/** Uploads data created before accounts existed. Runs once per user per device; the API is idempotent. */
export async function importLocalDataOnce(userId: string) {
  if (await AsyncStorage.getItem(key(userId))) return;

  const state = useStatsStore.getState();
  const favoriteAffirmationIds = Array.from(
    new Set(
      state.activityLog
        .filter((a) => a.type === "affirmation_liked" && a.affirmationId?.startsWith("aff_"))
        .map((a) => a.affirmationId!),
    ),
  );
  const body = {
    customAffirmations: state.customAffirmations.map((c) => ({
      clientId: c.id,
      text: c.text,
      isEnabled: c.isEnabled,
      createdAt: new Date(c.createdAt).toISOString(),
    })),
    favoriteAffirmationIds,
    activity: state.dailyStats
      .filter((d) => d.affirmationsViewed + d.affirmationsLiked + d.affirmationsShared + d.practiceSessionsCompleted > 0)
      .map((d) => ({
        date: d.date,
        viewed: d.affirmationsViewed,
        liked: d.affirmationsLiked,
        shared: d.affirmationsShared,
        practiceSessions: d.practiceSessionsCompleted,
      })),
  };

  const hasData = body.customAffirmations.length || body.favoriteAffirmationIds.length || body.activity.length;
  if (hasData) await api("/sync/import", { method: "POST", body });
  await AsyncStorage.setItem(key(userId), new Date().toISOString());
}
