import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { PrimaryButton } from "@/components/ui/Kit";
import { Fonts, usePalette } from "@/constants/Theme";
import { useIsPremium } from "@/stores/premiumStore";

/** Renders children for premium users, otherwise an upsell. */
export function PremiumGate({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const isPremium = useIsPremium();
  const palette = usePalette();
  const router = useRouter();

  if (isPremium) return <>{children}</>;

  return (
    <View style={styles.container}>
      <View style={[styles.icon, { backgroundColor: palette.accentSoft }]}>
        <Ionicons name="lock-closed" size={28} color={palette.accent} />
      </View>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.description, { color: palette.textMuted }]}>{description}</Text>
      <PrimaryButton title="Unlock with Premium" icon="diamond-outline" onPress={() => router.push("/paywall")} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 12,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 19,
    fontFamily: Fonts.semibold,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginTop: 8,
  },
  button: {
    alignSelf: "stretch",
    marginTop: 24,
  },
});
