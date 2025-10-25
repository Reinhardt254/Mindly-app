import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface BackgroundContextType {
  customBackground: string | null;
  setCustomBackground: (background: string | null) => void;
  loadCustomBackground: () => Promise<void>;
  resetBackground: () => Promise<void>;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(
  undefined
);

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error("useBackground must be used within a BackgroundProvider");
  }
  return context;
};

interface BackgroundProviderProps {
  children: ReactNode;
}

export const BackgroundProvider: React.FC<BackgroundProviderProps> = ({
  children,
}) => {
  const [customBackground, setCustomBackgroundState] = useState<string | null>(
    null
  );

  const loadCustomBackground = async () => {
    try {
      const savedBackground = await AsyncStorage.getItem("customBackground");
      setCustomBackgroundState(savedBackground);
    } catch (error) {
      console.error("Error loading custom background:", error);
    }
  };

  const setCustomBackground = (background: string | null) => {
    setCustomBackgroundState(background);
  };

  const resetBackground = async () => {
    try {
      await AsyncStorage.removeItem("customBackground");
      setCustomBackgroundState(null);
    } catch (error) {
      console.error("Error resetting background:", error);
    }
  };

  // Load background on mount
  useEffect(() => {
    loadCustomBackground();
  }, []);

  const value: BackgroundContextType = {
    customBackground,
    setCustomBackground,
    loadCustomBackground,
    resetBackground,
  };

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
};
