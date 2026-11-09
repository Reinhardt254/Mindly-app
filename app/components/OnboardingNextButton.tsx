import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Fonts, usePalette } from "@/constants/Theme";
import { useColorScheme } from "@/hooks/useColorScheme";

type Props = {
  label?: string;
  ready: boolean;
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
};

export function OnboardingNextButton({
  label = "Next",
  ready,
  onPress,
  loading = false,
  style,
}: Props) {
  const palette = usePalette();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!ready || loading}
      activeOpacity={0.85}
      style={[
        styles.button,
        ready
          ? {
              backgroundColor: palette.accent,
              borderColor: palette.accent,
            }
          : {
              backgroundColor: "transparent",
              borderColor: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.35)",
            },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text
          style={[
            styles.label,
            {
              color: ready
                ? "#FFFFFF"
                : isDark
                  ? "rgba(255,255,255,0.85)"
                  : "rgba(0,0,0,0.55)",
            },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 16,
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    textAlign: "center",
    fontSize: 18,
    fontFamily: Fonts.semibold,
  },
});
