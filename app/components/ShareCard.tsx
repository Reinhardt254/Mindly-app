import React, { forwardRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Fonts, Palette } from "@/constants/Theme";
import { APP_NAME } from "@/lib/config";

/** Rendered off-screen and captured with react-native-view-shot for image sharing (4:5). */
export const ShareCard = forwardRef<View, { text: string; category?: string }>(function ShareCard(
  { text, category },
  ref,
) {
  return (
    <View ref={ref} collapsable={false} style={styles.offscreen}>
      <LinearGradient colors={["#2B1D5C", "#5B3FD9", "#A855F7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.quoteMark}>
          <Ionicons name="sparkles" size={26} color="rgba(255,255,255,0.9)" />
        </View>
        <Text style={[styles.text, text.length > 90 && styles.textSmall]}>{text}</Text>
        {category ? <Text style={styles.category}>{category}</Text> : null}
        <View style={styles.footer}>
          <View style={styles.dot} />
          <Text style={styles.brand}>{APP_NAME}</Text>
          <Text style={styles.tagline}>daily affirmations</Text>
        </View>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  offscreen: {
    position: "absolute",
    left: -10000,
    top: 0,
    width: 400,
    height: 500,
  },
  card: {
    flex: 1,
    padding: 36,
    justifyContent: "center",
  },
  quoteMark: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 39,
    fontFamily: Fonts.bold,
    letterSpacing: -0.3,
  },
  textSmall: {
    fontSize: 23,
    lineHeight: 31,
  },
  category: {
    marginTop: 18,
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: Fonts.semibold,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    left: 36,
    right: 36,
    bottom: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.light.accentSoft,
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  tagline: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: Fonts.regular,
  },
});
