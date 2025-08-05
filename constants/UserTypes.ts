export interface UserProfile {
  name: string;
  ageRange: "18-25" | "26-35" | "36-45" | "46+";
  gender: "Male" | "Female" | "Non-binary" | "Prefer not to say";
  affirmationFrequency: 1 | 2 | 3 | 5;
  isFirstTime: boolean;
  lastAffirmationDate?: string;
  dailyAffirmationsShown: number;
}

export interface Affirmation {
  id: string;
  text: string;
  category:
    | "confidence"
    | "gratitude"
    | "strength"
    | "growth"
    | "self-love"
    | "motivation";
  tags?: string[];
}

export interface AppState {
  userProfile: UserProfile | null;
  currentAffirmationIndex: number;
  dailyAffirmationsShown: number;
  lastAffirmationDate: string | null;
}
