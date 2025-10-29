export interface UserProfile {
  name: string;
  ageRange: "13-17" | "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65+";
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say";
  affirmationFrequency: number; // Number of times per day
  reminderStartHour: number; // Start hour (0-23)
  reminderEndHour: number; // End hour (0-23)
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
