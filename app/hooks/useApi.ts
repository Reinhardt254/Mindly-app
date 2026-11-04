import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  AFFIRMATIONS,
  ALL_CATEGORY,
  CATEGORIES,
  CUSTOM_CATEGORY,
  CategoryInfo,
  Mood,
} from "@/constants/Affirmations";
import { Affirmation } from "@/constants/UserTypes";
import { api } from "@/lib/api";
import { localDate } from "@/lib/dates";

export interface ApiAffirmation {
  id: string;
  text: string;
  categoryId: string;
  moods: string[];
  isPremium: boolean;
}

export interface CustomAffirmationDto {
  id: string;
  clientId: string | null;
  text: string;
  source: "user" | "ai";
  isEnabled: boolean;
  createdAt: string;
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
}

export interface Me {
  user: { id: string; name: string; email: string; image: string | null };
  isPremium: boolean;
  streak: Streak;
  limits: { customAffirmations: number | null };
  counts: { customAffirmations: number; favorites: number };
}

export interface MoodEntry {
  id: string;
  mood: Mood;
  note: string | null;
  affirmationId: string | null;
  createdAt: string;
}

export interface Insights {
  range: "week" | "month";
  from: string;
  to: string;
  totalCheckins: number;
  moodCounts: Record<string, number>;
  averageScore: number | null;
  previousAverageScore: number | null;
  daily: { date: string; count: number; averageScore: number | null; topMood: string | null }[];
  topThemes: { id: string; name: string; color: string; icon: string; count: number }[];
  activity: {
    activeDays: number;
    dates: string[];
    viewed: number;
    liked: number;
    shared: number;
    practiceSessions: number;
  };
  streak: Streak;
}

export interface VoiceRecording {
  id: string;
  objectKey: string;
  mimeType: string;
  durationMs: number;
  affirmationId: string | null;
  affirmationText: string | null;
  createdAt: string;
  url: string;
}

export const toAffirmation = (a: ApiAffirmation): Affirmation => ({
  id: a.id,
  text: a.text,
  category: a.categoryId,
  moods: a.moods,
  isPremium: a.isPremium,
});

const customToAffirmation = (c: CustomAffirmationDto): Affirmation => ({
  id: `custom:${c.id}`,
  text: c.text,
  category: "custom",
  isCustom: true,
});

export const queryKeys = {
  me: ["me"] as const,
  categories: ["categories"] as const,
  affirmations: ["affirmations"] as const,
  daily: (date: string) => ["daily", date] as const,
  favorites: ["favorites"] as const,
  custom: ["custom-affirmations"] as const,
  recentMoods: ["moods", "recent"] as const,
  insights: (range: string) => ["moods", "insights", range] as const,
  voice: ["voice"] as const,
  aiUsage: ["ai", "usage"] as const,
};

export function useMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => api<Me>("/me", { query: { date: localDate() } }),
    enabled,
    staleTime: 60_000,
  });
}

export function useCategories() {
  const query = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => api<(CategoryInfo & { count: number })[]>("/affirmations/categories"),
    staleTime: 10 * 60_000,
  });
  const categories = useMemo<CategoryInfo[]>(
    () => (query.data ? [ALL_CATEGORY, ...query.data, CUSTOM_CATEGORY] : CATEGORIES),
    [query.data],
  );
  return { ...query, categories };
}

function useLibrary() {
  return useQuery({
    queryKey: queryKeys.affirmations,
    queryFn: async () => (await api<ApiAffirmation[]>("/affirmations")).map(toAffirmation),
    staleTime: 10 * 60_000,
  });
}

export function useDailyAffirmation() {
  const date = localDate();
  return useQuery({
    queryKey: queryKeys.daily(date),
    queryFn: async () => toAffirmation(await api<ApiAffirmation>("/affirmations/daily", { query: { date } })),
    staleTime: Infinity,
  });
}

/** Home feed: the daily affirmation first, then the library (or the user's own), with offline fallback. */
export function useAffirmationFeed(category: string) {
  const library = useLibrary();
  const custom = useCustomAffirmations();
  const daily = useDailyAffirmation();

  const items = useMemo<Affirmation[]>(() => {
    const own = (custom.data?.items ?? []).filter((c) => c.isEnabled).map(customToAffirmation);
    if (category === "custom") return own;

    const all = library.data ?? AFFIRMATIONS;
    if (category !== "all") return all.filter((a) => a.category === category);

    const mixed = [...all, ...own];
    const today = daily.data ?? fallbackDaily(all);
    return today ? [today, ...mixed.filter((a) => a.id !== today.id)] : mixed;
  }, [category, library.data, custom.data, daily.data]);

  return { items, dailyId: category === "all" ? (daily.data ?? fallbackDaily(AFFIRMATIONS))?.id : undefined, isLoading: library.isLoading };
}

function fallbackDaily(items: Affirmation[]): Affirmation | undefined {
  if (!items.length) return undefined;
  const seed = localDate().split("-").reduce((acc, n) => acc * 31 + Number(n), 7);
  return items[seed % items.length];
}

// ---------- Favorites ----------

export function useFavorites() {
  return useQuery({
    queryKey: queryKeys.favorites,
    queryFn: async () =>
      (await api<(ApiAffirmation & { favoritedAt: string })[]>("/favorites")).map((f) => ({
        ...toAffirmation(f),
        favoritedAt: f.favoritedAt,
      })),
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ affirmation, favorite }: { affirmation: Affirmation; favorite: boolean }) =>
      api(`/favorites/${encodeURIComponent(affirmation.id)}`, { method: favorite ? "PUT" : "DELETE" }),
    onMutate: async ({ affirmation, favorite }) => {
      await qc.cancelQueries({ queryKey: queryKeys.favorites });
      const previous = qc.getQueryData(queryKeys.favorites);
      qc.setQueryData(queryKeys.favorites, (old: (Affirmation & { favoritedAt: string })[] = []) =>
        favorite
          ? [{ ...affirmation, favoritedAt: new Date().toISOString() }, ...old.filter((f) => f.id !== affirmation.id)]
          : old.filter((f) => f.id !== affirmation.id),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(queryKeys.favorites, ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.favorites }),
  });
}

// ---------- Custom affirmations ----------

export function useCustomAffirmations(enabled = true) {
  return useQuery({
    queryKey: queryKeys.custom,
    queryFn: () => api<{ items: CustomAffirmationDto[]; limit: number | null }>("/custom-affirmations"),
    enabled,
  });
}

export function useCustomAffirmationMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.custom });
    qc.invalidateQueries({ queryKey: queryKeys.me });
  };
  return {
    create: useMutation({
      mutationFn: (body: { text: string; source?: "user" | "ai" }) =>
        api<CustomAffirmationDto>("/custom-affirmations", { method: "POST", body }),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, ...body }: { id: string; text?: string; isEnabled?: boolean }) =>
        api<CustomAffirmationDto>(`/custom-affirmations/${id}`, { method: "PATCH", body }),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) => api(`/custom-affirmations/${id}`, { method: "DELETE" }),
      onSuccess: invalidate,
    }),
  };
}

// ---------- Moods ----------

export function useRecentMoods() {
  return useQuery({ queryKey: queryKeys.recentMoods, queryFn: () => api<MoodEntry[]>("/moods/recent") });
}

export function useMoodCheckin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { mood: Mood; note?: string }) => {
      const res = await api<{ entry: MoodEntry; affirmation: ApiAffirmation | null; streak: Streak }>("/moods", {
        method: "POST",
        body: { ...body, date: localDate() },
      });
      return { ...res, affirmation: res.affirmation ? toAffirmation(res.affirmation) : null };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["moods"] });
      qc.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

export function useInsights(range: "week" | "month", enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.insights(range),
    queryFn: () =>
      api<Insights>("/moods/insights", {
        query: { range, today: localDate(), tz: new Date().getTimezoneOffset() },
      }),
    enabled,
  });
}

// ---------- Voice ----------

export function useVoiceRecordings(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.voice,
    queryFn: () => api<VoiceRecording[]>("/voice"),
    enabled,
    staleTime: 30 * 60_000,
  });
}

export function useDeleteVoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/voice/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.voice }),
  });
}

// ---------- AI ----------

export function useAiUsage(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.aiUsage,
    queryFn: () => api<{ used: number; limit: number; remaining: number }>("/ai/usage"),
    enabled,
  });
}

export function useAiGenerate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { situation: string; lang?: string }) =>
      api<{ affirmations: string[]; crisis: boolean; remaining: number }>("/ai/affirmations", {
        method: "POST",
        body,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.aiUsage }),
  });
}
