import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CATEGORIES,
  AffirmationCategory,
  CategoryInfo,
} from "@/constants/Affirmations";

interface CategoryState {
  selectedCategory: AffirmationCategory;
  setSelectedCategory: (category: AffirmationCategory) => void;
  resetCategory: () => void;
  getCategoryInfo: (category: AffirmationCategory) => CategoryInfo | undefined;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      selectedCategory: "all",

      setSelectedCategory: (category: AffirmationCategory) => {
        set({ selectedCategory: category });
        console.log(`Category changed to: ${category}`);
      },

      resetCategory: () => {
        set({ selectedCategory: "all" });
      },

      getCategoryInfo: (category: AffirmationCategory) => {
        return CATEGORIES.find((cat) => cat.id === category);
      },
    }),
    {
      name: "category-storage",
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
