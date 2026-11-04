import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useStatsStore } from "@/stores/statsStore";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotificationsToggle } from "@/hooks/useNotificationsToggle";
import { useMe } from "@/hooks/useApi";
import { useIsPremium } from "@/stores/premiumStore";
import { api } from "@/lib/api";
import { signOut } from "@/lib/auth-client";
import { resetPurchaser } from "@/lib/purchases";
import { queryClient } from "@/lib/queryClient";
import { Ionicons } from "@expo/vector-icons";
import { Popup } from "@/components/Popup";
import {
  Card,
  ListRow,
  Screen,
  SectionLabel,
  Toggle,
} from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";

export default function ProfileScreen() {
  const router = useRouter();
  const palette = usePalette();
  const { userProfile, clearAllData } = useLocalStorage();
  const { resetStats, totalAffirmationsViewed, getStreakInfo } =
    useStatsStore();
  const { isDark, setThemeMode } = useTheme();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    title: "",
    message: "",
    buttons: [] as {
      text: string;
      onPress: () => void;
      style?: "default" | "destructive" | "cancel";
    }[],
  });

  const showPopup = (
    title: string,
    message: string,
    buttons: {
      text: string;
      onPress: () => void;
      style?: "default" | "destructive" | "cancel";
    }[]
  ) => {
    setPopupConfig({ title, message, buttons });
    setIsPopupVisible(true);
  };

  const notifications = useNotificationsToggle(showPopup);
  const me = useMe();
  const isPremium = useIsPremium();
  const localStreak = getStreakInfo();
  const streak = me.data
    ? { current: me.data.streak.currentStreak }
    : localStreak;

  const premiumRoute = (route: "/(tabs)/insights" | "/(tabs)/ai" | "/(tabs)/voice") =>
    router.push(isPremium ? route : "/paywall");
  const lock = isPremium ? undefined : (
    <Ionicons name="lock-closed" size={16} color={palette.accent} />
  );

  const clearDevice = async () => {
    await resetPurchaser();
    await signOut();
    queryClient.clear();
    await clearAllData();
    resetStats();
    router.replace("/welcome");
  };

  const handleLogout = () => {
    showPopup(
      "Log out",
      "Your favorites, streak and affirmations stay saved in your account.",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            try {
              await clearDevice();
            } catch (error) {
              console.error("Error during logout:", error);
              showPopup("Error", "Failed to log out. Please try again.", [
                { text: "OK", onPress: () => {} },
              ]);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    showPopup(
      "Delete account",
      "This permanently deletes your account, favorites, mood history, recordings and affirmations. Subscriptions must be cancelled in the store separately.",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete forever",
          style: "destructive",
          onPress: async () => {
            try {
              await api("/me", { method: "DELETE" });
              await clearDevice();
            } catch (error) {
              console.error("Error deleting account:", error);
              showPopup("Error", "Failed to delete your account. Please try again.", [
                { text: "OK", onPress: () => {} },
              ]);
            }
          },
        },
      ]
    );
  };

  if (!userProfile) {
    return <View style={[styles.flex, { backgroundColor: palette.background }]} />;
  }

  return (
    <Screen title="Profile">
      {/* Hero */}
      <LinearGradient
        colors={palette.accentGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userProfile.name.trim().charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.heroText}>
          <Text style={styles.heroName} numberOfLines={1}>
            {userProfile.name}
          </Text>
          <Text style={styles.heroMeta} numberOfLines={1}>
            {me.data?.user.email ?? `${totalAffirmationsViewed} read`}
          </Text>
          <Text style={styles.heroMeta}>
            {streak.current} day streak{isPremium ? " · Premium" : ""}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/edit-profile")}
          style={styles.heroButton}
          activeOpacity={0.85}
        >
          <Text style={[styles.heroButtonText, { color: palette.accent }]}>
            Edit
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {!isPremium && (
        <TouchableOpacity
          onPress={() => router.push("/paywall")}
          activeOpacity={0.85}
          style={[styles.upgrade, { backgroundColor: palette.accentSoft }]}
        >
          <Ionicons name="diamond-outline" size={22} color={palette.accent} />
          <View style={styles.heroText}>
            <Text style={[styles.upgradeTitle, { color: palette.text }]}>
              Go Premium
            </Text>
            <Text style={[styles.upgradeText, { color: palette.textMuted }]}>
              AI affirmations, your voice, insights and all packs
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={palette.accent} />
        </TouchableOpacity>
      )}

      <SectionLabel>Premium</SectionLabel>
      <Card>
        <ListRow
          icon="sparkles-outline"
          label="AI Affirmations"
          subtitle="Describe your situation, get tailored affirmations"
          onPress={() => premiumRoute("/(tabs)/ai")}
          right={lock}
        />
        <ListRow
          icon="mic-outline"
          label="My Voice"
          subtitle="Affirmations recorded in your own voice"
          onPress={() => premiumRoute("/(tabs)/voice")}
          right={lock}
        />
        <ListRow
          icon="analytics-outline"
          label="Insights"
          subtitle="Mood trends and progress summaries"
          onPress={() => premiumRoute("/(tabs)/insights")}
          right={lock}
          isLast
        />
      </Card>

      <SectionLabel>Settings</SectionLabel>
      <Card>
        <ListRow
          icon="person-outline"
          label="Edit Profile"
          onPress={() => router.push("/(tabs)/edit-profile")}
        />
        <ListRow
          icon="notifications-outline"
          label="Notifications"
          right={
            <Toggle
              value={notifications.enabled}
              onValueChange={notifications.toggle}
              disabled={notifications.isChecking}
            />
          }
        />
        <ListRow
          icon="image-outline"
          label="Background"
          onPress={() => router.push("/(tabs)/theme")}
        />
        <ListRow
          icon="moon-outline"
          label="Dark Theme"
          right={
            <Toggle
              value={isDark}
              onValueChange={(v) => setThemeMode(v ? "dark" : "light")}
            />
          }
        />
        <ListRow
          icon="options-outline"
          label="More Settings"
          onPress={() => router.push("/(tabs)/settings")}
          isLast
        />
      </Card>

      <SectionLabel>Your Affirmations</SectionLabel>
      <Card>
        <ListRow
          icon="bookmark-outline"
          label="Favorite Affirmations"
          onPress={() => router.push("/(tabs)/favorites")}
        />
        <ListRow
          icon="create-outline"
          label="Your Affirmations"
          onPress={() => router.push("/(tabs)/add")}
        />
        <ListRow
          icon="layers-outline"
          label="Categories"
          onPress={() => router.push("/(tabs)/categories")}
        />
        <ListRow
          icon="stats-chart-outline"
          label="Your Progress"
          onPress={() => router.push("/(tabs)/stats")}
          isLast
        />
      </Card>

      <SectionLabel>Support</SectionLabel>
      <Card>
        <ListRow
          icon="information-circle-outline"
          label="Version"
          value="1.0.0"
          onPress={() => router.push("/(tabs)/version")}
        />
        <ListRow
          icon="document-text-outline"
          label="Terms of Service"
          onPress={() => router.push("/(tabs)/terms-of-service")}
        />
        <ListRow
          icon="shield-checkmark-outline"
          label="Privacy Policy"
          onPress={() => router.push("/(tabs)/privacy-policy")}
          isLast
        />
      </Card>

      <Card style={styles.logoutCard}>
        <ListRow
          icon="log-out-outline"
          label="Log out"
          onPress={handleLogout}
          destructive
        />
        <ListRow
          icon="trash-outline"
          label="Delete account"
          onPress={handleDeleteAccount}
          destructive
          isLast
        />
      </Card>

      <Popup
        visible={isPopupVisible}
        title={popupConfig.title}
        message={popupConfig.message}
        buttons={popupConfig.buttons}
        onClose={() => setIsPopupVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: Radius.lg,
    boxShadow: "0 12px 28px rgba(124, 92, 252, 0.28)",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: Fonts.bold,
  },
  heroText: {
    flex: 1,
  },
  heroName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  heroMeta: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    fontFamily: Fonts.regular,
    marginTop: 3,
  },
  heroButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: Radius.pill,
  },
  heroButtonText: {
    fontSize: 14,
    fontFamily: Fonts.semibold,
  },
  logoutCard: {
    marginTop: 22,
  },
  upgrade: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: Radius.lg,
    marginTop: 14,
  },
  upgradeTitle: {
    fontSize: 15,
    fontFamily: Fonts.semibold,
  },
  upgradeText: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
});
