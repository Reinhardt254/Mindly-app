export interface UserProfile {
  name: string;
  ageRange: "13-17" | "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65+";
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say";
  affirmationFrequency: 1 | 3 | 5;
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
