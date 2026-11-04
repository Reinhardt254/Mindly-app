import content from "./affirmationContent.json";
import { Affirmation } from "./UserTypes";

// Offline fallback, generated from server/prisma/content.ts (npm run export-content in /server).
export const MOODS = content.moods as Mood[];

export type Mood =
  | "happy"
  | "calm"
  | "grateful"
  | "tired"
  | "anxious"
  | "stressed"
  | "sad"
  | "angry";

export const MOOD_INFO: Record<Mood, { label: string; emoji: string }> = {
  happy: { label: "Happy", emoji: "😊" },
  calm: { label: "Calm", emoji: "😌" },
  grateful: { label: "Grateful", emoji: "🙏" },
  tired: { label: "Tired", emoji: "😴" },
  anxious: { label: "Anxious", emoji: "😟" },
  stressed: { label: "Stressed", emoji: "😣" },
  sad: { label: "Sad", emoji: "😢" },
  angry: { label: "Angry", emoji: "😠" },
};

export const AFFIRMATIONS: Affirmation[] = content.affirmations.map((a) => ({
  id: a.id,
  text: a.text,
  category: a.categoryId,
  moods: a.moods,
  tags: "tags" in a ? (a.tags as string[]) : undefined,
}));

/** "all" and "custom" are virtual categories; the rest come from the server. */
export type AffirmationCategory = string;

export interface CategoryInfo {
  id: AffirmationCategory;
  name: string;
  icon: string; // Ionicons name
  color: string;
  description: string;
  isPremium?: boolean;
  locked?: boolean;
}

export const ALL_CATEGORY: CategoryInfo = {
  id: "all",
  name: "All Affirmations",
  icon: "apps",
  color: "#8B5CF6",
  description: "A mix from every category",
};

export const CUSTOM_CATEGORY: CategoryInfo = {
  id: "custom",
  name: "Your Affirmations",
  icon: "create",
  color: "#7C5CFC",
  description: "The ones you wrote",
};

export const CATEGORIES: CategoryInfo[] = [
  ALL_CATEGORY,
  ...content.categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    color: c.color,
    description: c.description,
    isPremium: c.isPremium,
    locked: c.isPremium,
  })),
  CUSTOM_CATEGORY,
];

export function findCategory(id: string, categories: CategoryInfo[] = CATEGORIES) {
  return categories.find((c) => c.id === id) ?? CATEGORIES.find((c) => c.id === id);
}
