import React from "react";
import { ViewStyle, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  const contentStyle = { flex: 1, paddingTop: insets.top };

  if (colorScheme === "dark") {
    return (
      <View style={[{ flex: 1, backgroundColor: "#000" }, style]}>
        <View style={contentStyle}>{children}</View>
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
      <View style={contentStyle}>{children}</View>
    </LinearGradient>
  );
};
