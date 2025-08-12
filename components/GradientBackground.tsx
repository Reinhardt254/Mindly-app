import React from "react";
import { ViewStyle, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/useColorScheme";
import { gradientColorsLight, gradientColorsDark } from "@/constants/Colors";

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
}) => {
  const colorScheme = useColorScheme();

  if (colorScheme === "dark") {
    return (
      <View style={[{ flex: 1, backgroundColor: "#000" }, style]}>
        {children}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={gradientColorsLight as any}
      style={[{ flex: 1 }, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};
