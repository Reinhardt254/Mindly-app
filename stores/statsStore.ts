import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ActivityLog {
  id: string;
  type:
    | "affirmation_viewed"
    | "affirmation_liked"
    | "affirmation_shared"
    | "affirmation_refreshed"
    | "practice_session_completed";
  timestamp: number;
  affirmationId?: string;
  affirmationText?: string;
  affirmationCategory?: string;
  affirmationCount?: number;
  duration?: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  affirmationsViewed: number;
  affirmationsLiked: number;
  affirmationsShared: number;
  affirmationsRefreshed: number;
  practiceSessionsCompleted: number;
  goalMet: boolean;
  streakDay: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  unlocked: boolean;
  requirement: {
    type:
      | "total_affirmations"
      | "streak_days"
      | "daily_goal"
      | "likes"
      | "shares";
    value: number;
  };
}

export interface CustomAffirmation {
  id: string;
  text: string;
  category: string;
  createdAt: number;
  isEnabled: boolean;
}

export interface StatsState {
  // Activity tracking
  activityLog: ActivityLog[];
  dailyStats: DailyStats[];

  // Current stats
  totalAffirmationsViewed: number;
  totalAffirmationsLiked: number;
  totalAffirmationsShared: number;
  totalAffirmationsRefreshed: number;
  totalPracticeSessionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  daysActive: number;

  // Achievements
  achievements: Achievement[];

  // Custom affirmations
  customAffirmations: CustomAffirmation[];

  // Actions
  logActivity: (activity: Omit<ActivityLog, "id" | "timestamp">) => void;
  updateDailyStats: (date: string) => void;
  checkAchievements: () => void;
  resetStats: () => void;
  getTodayStats: () => DailyStats | null;
  getWeeklyStats: () => DailyStats[];
  getStreakInfo: () => { current: number; longest: number };

  // Custom affirmations actions
  addCustomAffirmation: (
    affirmation: Omit<CustomAffirmation, "id" | "createdAt">
  ) => void;
  updateCustomAffirmation: (
    id: string,
    updates: Partial<CustomAffirmation>
  ) => void;
  removeCustomAffirmation: (id: string) => void;
  toggleCustomAffirmation: (id: string) => void;
}

const defaultAchievements: Achievement[] = [
  {
    id: "first_steps",
    title: "First Steps",
    description: "Complete your first affirmation",
    icon: "checkmark",
    unlocked: false,
    requirement: { type: "total_affirmations", value: 1 },
  },
  {
    id: "on_fire",
    title: "On Fire",
    description: "Complete 7 days in a row",
    icon: "flame",
    unlocked: false,
    requirement: { type: "streak_days", value: 7 },
  },
  {
    id: "affirmation_master",
    title: "Affirmation Master",
    description: "Complete 30 days in a row",
    icon: "star",
    unlocked: false,
    requirement: { type: "streak_days", value: 30 },
  },
  {
    id: "heart_lover",
    title: "Heart Lover",
    description: "Like 50 affirmations",
    icon: "heart",
    unlocked: false,
    requirement: { type: "likes", value: 50 },
  },
  {
    id: "social_butterfly",
    title: "Social Butterfly",
    description: "Share 25 affirmations",
    icon: "share-social",
    unlocked: false,
    requirement: { type: "shares", value: 25 },
  },
  {
    id: "goal_crusher",
    title: "Goal Crusher",
    description: "Meet your daily goal 10 times",
    icon: "trophy",
    unlocked: false,
    requirement: { type: "daily_goal", value: 10 },
  },
];

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      // Initial state
      activityLog: [],
      dailyStats: [],
      totalAffirmationsViewed: 0,
      totalAffirmationsLiked: 0,
      totalAffirmationsShared: 0,
      totalAffirmationsRefreshed: 0,
      totalPracticeSessionsCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      daysActive: 0,
      achievements: defaultAchievements,
      customAffirmations: [],

      // Log activity
      logActivity: (activity) => {
        const newActivity: ActivityLog = {
          ...activity,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };

        set((state) => {
          const newActivityLog = [...state.activityLog, newActivity];

          // Update counters based on activity type
          const updates: Partial<StatsState> = { activityLog: newActivityLog };

          switch (activity.type) {
            case "affirmation_viewed":
              updates.totalAffirmationsViewed =
                state.totalAffirmationsViewed + 1;
              break;
            case "affirmation_liked":
              updates.totalAffirmationsLiked = state.totalAffirmationsLiked + 1;
              break;
            case "affirmation_shared":
              updates.totalAffirmationsShared =
                state.totalAffirmationsShared + 1;
              break;
            case "affirmation_refreshed":
              updates.totalAffirmationsRefreshed =
                state.totalAffirmationsRefreshed + 1;
              break;
            case "practice_session_completed":
              updates.totalPracticeSessionsCompleted =
                state.totalPracticeSessionsCompleted + 1;
              break;
          }

          return updates;
        });

        // Update daily stats and check achievements
        get().updateDailyStats(new Date().toISOString().split("T")[0]);
        get().checkAchievements();
      },

      // Update daily stats
      updateDailyStats: (date) => {
        set((state) => {
          const today = date;
          const todayActivities = state.activityLog.filter(
            (activity) =>
              new Date(activity.timestamp).toISOString().split("T")[0] === today
          );

          const affirmationsViewed = todayActivities.filter(
            (a) => a.type === "affirmation_viewed"
          ).length;
          const affirmationsLiked = todayActivities.filter(
            (a) => a.type === "affirmation_liked"
          ).length;
          const affirmationsShared = todayActivities.filter(
            (a) => a.type === "affirmation_shared"
          ).length;
          const affirmationsRefreshed = todayActivities.filter(
            (a) => a.type === "affirmation_refreshed"
          ).length;
          const practiceSessionsCompleted = todayActivities.filter(
            (a) => a.type === "practice_session_completed"
          ).length;

          // Check if daily goal is met (assuming goal is 3 affirmations per day)
          const goalMet = affirmationsViewed >= 3;

          // Calculate streak
          const sortedStats = [...state.dailyStats].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          let streakDay = 1;
          if (sortedStats.length > 0) {
            const lastStat = sortedStats[0];
            const lastDate = new Date(lastStat.date);
            const todayDate = new Date(today);
            const diffTime = todayDate.getTime() - lastDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1 && lastStat.goalMet) {
              streakDay = lastStat.streakDay + 1;
            } else if (diffDays > 1) {
              streakDay = 1; // Streak broken
            }
          }

          const newDailyStat: DailyStats = {
            date: today,
            affirmationsViewed,
            affirmationsLiked,
            affirmationsShared,
            affirmationsRefreshed,
            practiceSessionsCompleted,
            goalMet,
            streakDay,
          };

          // Update or add daily stat
          const existingStatIndex = state.dailyStats.findIndex(
            (stat) => stat.date === today
          );
          let newDailyStats;

          if (existingStatIndex >= 0) {
            newDailyStats = [...state.dailyStats];
            newDailyStats[existingStatIndex] = newDailyStat;
          } else {
            newDailyStats = [...state.dailyStats, newDailyStat];
          }

          // Calculate current streak and longest streak
          const sortedNewStats = newDailyStats.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          let currentStreak = 0;
          let longestStreak = 0;
          let tempStreak = 0;

          for (const stat of sortedNewStats) {
            if (stat.goalMet) {
              tempStreak++;
              longestStreak = Math.max(longestStreak, tempStreak);
            } else {
              if (currentStreak === 0) currentStreak = tempStreak;
              tempStreak = 0;
            }
          }

          if (currentStreak === 0) currentStreak = tempStreak;

          // Calculate days active
          const daysActive = newDailyStats.filter(
            (stat) => stat.affirmationsViewed > 0
          ).length;

          return {
            dailyStats: newDailyStats,
            currentStreak,
            longestStreak,
            daysActive,
          };
        });
      },

      // Check achievements
      checkAchievements: () => {
        set((state) => {
          const updatedAchievements = state.achievements.map((achievement) => {
            if (achievement.unlocked) return achievement;

            let requirementMet = false;

            switch (achievement.requirement.type) {
              case "total_affirmations":
                requirementMet =
                  state.totalAffirmationsViewed >=
                  achievement.requirement.value;
                break;
              case "streak_days":
                requirementMet =
                  state.currentStreak >= achievement.requirement.value;
                break;
              case "daily_goal":
                const goalMetDays = state.dailyStats.filter(
                  (stat) => stat.goalMet
                ).length;
                requirementMet = goalMetDays >= achievement.requirement.value;
                break;
              case "likes":
                requirementMet =
                  state.totalAffirmationsLiked >= achievement.requirement.value;
                break;
              case "shares":
                requirementMet =
                  state.totalAffirmationsShared >=
                  achievement.requirement.value;
                break;
            }

            if (requirementMet && !achievement.unlocked) {
              return {
                ...achievement,
                unlocked: true,
                unlockedAt: Date.now(),
              };
            }

            return achievement;
          });

          return { achievements: updatedAchievements };
        });
      },

      // Get today's stats
      getTodayStats: () => {
        const state = get();
        const today = new Date().toISOString().split("T")[0];
        return state.dailyStats.find((stat) => stat.date === today) || null;
      },

      // Get weekly stats
      getWeeklyStats: () => {
        const state = get();
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        return state.dailyStats
          .filter((stat) => {
            const statDate = new Date(stat.date);
            return statDate >= weekAgo && statDate <= today;
          })
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
      },

      // Get streak info
      getStreakInfo: () => {
        const state = get();
        return {
          current: state.currentStreak,
          longest: state.longestStreak,
        };
      },

      // Reset stats
      resetStats: () => {
        set({
          activityLog: [],
          dailyStats: [],
          totalAffirmationsViewed: 0,
          totalAffirmationsLiked: 0,
          totalAffirmationsShared: 0,
          totalAffirmationsRefreshed: 0,
          totalPracticeSessionsCompleted: 0,
          currentStreak: 0,
          longestStreak: 0,
          daysActive: 0,
          achievements: defaultAchievements,
          customAffirmations: [],
        });
      },

      // Custom affirmations actions
      addCustomAffirmation: (affirmation) => {
        const newAffirmation: CustomAffirmation = {
          ...affirmation,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
        };

        set((state) => ({
          customAffirmations: [newAffirmation, ...state.customAffirmations],
        }));
      },

      updateCustomAffirmation: (id, updates) => {
        set((state) => ({
          customAffirmations: state.customAffirmations.map((affirmation) =>
            affirmation.id === id ? { ...affirmation, ...updates } : affirmation
          ),
        }));
      },

      removeCustomAffirmation: (id) => {
        set((state) => ({
          customAffirmations: state.customAffirmations.filter(
            (affirmation) => affirmation.id !== id
          ),
        }));
      },

      toggleCustomAffirmation: (id) => {
        set((state) => ({
          customAffirmations: state.customAffirmations.map((affirmation) =>
            affirmation.id === id
              ? { ...affirmation, isEnabled: !affirmation.isEnabled }
              : affirmation
          ),
        }));
      },
    }),
    {
      name: "stats-storage",
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
