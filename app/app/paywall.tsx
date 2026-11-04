import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { PurchasesPackage } from "react-native-purchases";
import { PrimaryButton } from "@/components/ui/Kit";
import { Fonts, Radius, usePalette } from "@/constants/Theme";
import { buy, getPackages, purchasesAvailable, restore } from "@/lib/purchases";
import { usePremiumStore } from "@/stores/premiumStore";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  { icon: "sparkles", title: "AI affirmations", text: "Describe your situation and get affirmations written for you" },
  { icon: "mic", title: "Your own voice", text: "Record affirmations and play them back anytime" },
  { icon: "analytics", title: "Mood insights", text: "Weekly and monthly trends, themes and streak history" },
  { icon: "infinite", title: "Unlimited custom affirmations", text: "Write as many as you like" },
  { icon: "albums", title: "All premium packs", text: "Anxiety, career, exam stress, new parents, healing and more" },
];

function packageLabel(pkg: PurchasesPackage) {
  switch (pkg.packageType) {
    case "MONTHLY":
      return { title: "Monthly", period: "/ month" };
    case "ANNUAL":
      return { title: "Yearly", period: "/ year" };
    case "LIFETIME":
      return { title: "Lifetime", period: "one-time" };
    default:
      return { title: pkg.product.title, period: "" };
  }
}

function hasFreeTrial(pkg: PurchasesPackage) {
  const product: any = pkg.product;
  return product.introPrice?.price === 0 || !!product.defaultOption?.freePhase;
}

export default function PaywallScreen() {
  const palette = usePalette();
  const router = useRouter();
  const qc = useQueryClient();
  const { isPremium, setStorePremium } = usePremiumStore();
  const [selected, setSelected] = useState<PurchasesPackage | null>(null);
  const [busy, setBusy] = useState<"buy" | "restore" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const packages = useQuery({
    queryKey: ["rc-packages"],
    queryFn: getPackages,
    enabled: purchasesAvailable(),
    staleTime: 10 * 60_000,
  });

  useEffect(() => {
    if (!selected && packages.data?.length) {
      setSelected(packages.data.find((p) => p.packageType === "ANNUAL") ?? packages.data[0]);
    }
  }, [packages.data, selected]);

  const finish = async (unlocked: boolean) => {
    if (!unlocked) return;
    setStorePremium(true);
    await qc.invalidateQueries();
    router.back();
  };

  const handleBuy = async () => {
    if (!selected) return;
    setBusy("buy");
    setMessage(null);
    try {
      await finish(await buy(selected));
    } catch (e: any) {
      setMessage(e?.message ?? "Purchase failed. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleRestore = async () => {
    setBusy("restore");
    setMessage(null);
    try {
      const unlocked = await restore();
      if (unlocked) await finish(true);
      else setMessage("No active purchases found for this account.");
    } catch (e: any) {
      setMessage(e?.message ?? "Restore failed. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: palette.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.close} hitSlop={12}>
          <Ionicons name="close" size={24} color={palette.textMuted} />
        </TouchableOpacity>

        <LinearGradient
          colors={palette.accentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
          <Ionicons name="diamond" size={30} color="#FFFFFF" />
        </LinearGradient>
        <Text style={[styles.title, { color: palette.text }]}>Moodly Premium</Text>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>
          Make your daily practice truly yours.
        </Text>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.feature}>
              <View style={[styles.featureIcon, { backgroundColor: palette.accentSoft }]}>
                <Ionicons name={f.icon} size={18} color={palette.accent} />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.featureTitle, { color: palette.text }]}>{f.title}</Text>
                <Text style={[styles.featureText, { color: palette.textMuted }]}>{f.text}</Text>
              </View>
            </View>
          ))}
        </View>

        {isPremium ? (
          <View style={[styles.notice, { backgroundColor: palette.accentSoft }]}>
            <Ionicons name="checkmark-circle" size={20} color={palette.accent} />
            <Text style={[styles.noticeText, { color: palette.text }]}>You're Premium. Thank you!</Text>
          </View>
        ) : !purchasesAvailable() ? (
          <View style={[styles.notice, { backgroundColor: palette.surfaceMuted }]}>
            <Text style={[styles.noticeText, { color: palette.textMuted }]}>
              Purchases aren't available in this build.
            </Text>
          </View>
        ) : packages.isLoading ? (
          <ActivityIndicator color={palette.accent} style={{ marginVertical: 24 }} />
        ) : (
          <View style={styles.packages}>
            {(packages.data ?? []).map((pkg) => {
              const label = packageLabel(pkg);
              const active = selected?.identifier === pkg.identifier;
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  onPress={() => setSelected(pkg)}
                  activeOpacity={0.85}
                  style={[
                    styles.package,
                    {
                      backgroundColor: palette.surface,
                      borderColor: active ? palette.accent : palette.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={active ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={active ? palette.accent : palette.textMuted}
                  />
                  <View style={styles.flex}>
                    <Text style={[styles.packageTitle, { color: palette.text }]}>{label.title}</Text>
                    {hasFreeTrial(pkg) && (
                      <Text style={[styles.trial, { color: palette.accent }]}>Free trial included</Text>
                    )}
                  </View>
                  <Text style={[styles.price, { color: palette.text }]}>
                    {pkg.product.priceString}
                    <Text style={[styles.period, { color: palette.textMuted }]}> {label.period}</Text>
                  </Text>
                </TouchableOpacity>
              );
            })}
            {packages.data?.length === 0 && (
              <Text style={[styles.noticeText, { color: palette.textMuted, textAlign: "center" }]}>
                No plans are available right now.
              </Text>
            )}
          </View>
        )}

        {message && <Text style={[styles.message, { color: palette.danger }]}>{message}</Text>}
      </ScrollView>

      {!isPremium && purchasesAvailable() && (
        <View style={styles.footer}>
          <PrimaryButton
            title={selected && hasFreeTrial(selected) ? "Start free trial" : "Continue"}
            onPress={handleBuy}
            loading={busy === "buy"}
            disabled={!selected || !!busy}
          />
          <View style={styles.links}>
            <TouchableOpacity onPress={handleRestore} disabled={!!busy}>
              <Text style={[styles.link, { color: palette.textMuted }]}>
                {busy === "restore" ? "Restoring..." : "Restore purchases"}
              </Text>
            </TouchableOpacity>
            <Text style={{ color: palette.textMuted }}>·</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/terms-of-service")}>
              <Text style={[styles.link, { color: palette.textMuted }]}>Terms</Text>
            </TouchableOpacity>
            <Text style={{ color: palette.textMuted }}>·</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/privacy-policy")}>
              <Text style={[styles.link, { color: palette.textMuted }]}>Privacy</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.fineprint, { color: palette.textMuted }]}>
            Subscriptions renew automatically until cancelled in your store account settings.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 24,
    paddingBottom: 30,
  },
  close: {
    alignSelf: "flex-end",
  },
  badge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    textAlign: "center",
    marginTop: 16,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginTop: 6,
  },
  features: {
    gap: 16,
    marginTop: 28,
    marginBottom: 26,
  },
  feature: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 15,
    fontFamily: Fonts.semibold,
  },
  featureText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    marginTop: 1,
  },
  packages: {
    gap: 10,
  },
  package: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  packageTitle: {
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
  trial: {
    fontSize: 12.5,
    fontFamily: Fonts.medium,
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  period: {
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: Radius.md,
  },
  noticeText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
  message: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    textAlign: "center",
    marginTop: 14,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
  },
  links: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 14,
  },
  link: {
    fontSize: 13,
    fontFamily: Fonts.medium,
  },
  fineprint: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginTop: 10,
  },
});
