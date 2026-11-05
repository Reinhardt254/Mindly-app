import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRouter } from "expo-router";
import { Fonts, Radius, usePalette } from "@/constants/Theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export function Screen({
  title,
  right,
  children,
  footer,
  scroll = true,
  contentStyle,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const palette = usePalette();

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <ScreenHeader title={title} right={right} />
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.content, contentStyle]}>
          {children}
        </View>
      )}
      {footer}
    </View>
  );
}

export function ScreenHeader({
  title,
  right,
  onBack,
}: {
  title: string;
  right?: React.ReactNode;
  onBack?: () => void;
}) {
  const router = useRouter();
  const navigation = useNavigation();
  const palette = usePalette();

  const handleBack = () => {
    if (onBack) return onBack();
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={handleBack}
        hitSlop={12}
        style={[styles.backButton, { borderColor: palette.iconRing }]}
      >
        <Ionicons name="chevron-back" size={18} color={palette.text} />
      </TouchableOpacity>
      <Text
        numberOfLines={1}
        style={[styles.headerTitle, { color: palette.text }]}
      >
        {title}
      </Text>
      {right}
    </View>
  );
}

export function SectionLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  const palette = usePalette();
  return (
    <Text style={[styles.sectionLabel, { color: palette.textMuted }, style]}>
      {children}
    </Text>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const palette = usePalette();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.surface, borderColor: palette.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function IconCircle({
  name,
  color,
  size = 36,
  tint,
}: {
  name: IconName;
  color?: string;
  size?: number;
  tint?: string;
}) {
  const palette = usePalette();
  return (
    <View
      style={[
        styles.iconCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: tint ? "transparent" : palette.iconRing,
          backgroundColor: tint ?? "transparent",
        },
      ]}
    >
      <Ionicons name={name} size={size * 0.47} color={color ?? palette.text} />
    </View>
  );
}

export function ListRow({
  icon,
  label,
  subtitle,
  value,
  onPress,
  right,
  destructive,
  isLast,
}: {
  icon?: IconName;
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
  isLast?: boolean;
}) {
  const palette = usePalette();
  const color = destructive ? palette.danger : palette.text;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.row,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: palette.border,
        },
      ]}
    >
      {icon && (
        <IconCircle
          name={icon}
          color={color}
          tint={destructive ? palette.dangerSoft : undefined}
        />
      )}
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color }]}>{label}</Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: palette.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text style={[styles.rowValue, { color: palette.textMuted }]}>
          {value}
        </Text>
      ) : null}
      {right ??
        (onPress && !destructive ? (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={palette.textMuted}
          />
        ) : null)}
    </TouchableOpacity>
  );
}

export function Toggle({
  value,
  onValueChange,
  disabled,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  const palette = usePalette();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: palette.iconRing, true: palette.accent }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={palette.iconRing}
    />
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const palette = usePalette();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[styles.primaryWrap, { opacity: disabled ? 0.45 : 1 }, style]}
    >
      <LinearGradient
        colors={palette.accentGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.primary}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            {icon && <Ionicons name={icon} size={18} color="#FFFFFF" />}
            <Text style={styles.primaryText}>{title}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
}) {
  const palette = usePalette();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: palette.accentSoft }]}>
        <Ionicons name={icon} size={30} color={palette.accent} />
      </View>
      <Text style={[styles.emptyTitle, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.emptySubtitle, { color: palette.textMuted }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 26,
    fontFamily: Fonts.bold,
    letterSpacing: -0.4,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    marginTop: 22,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
  },
  iconCircle: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: Fonts.medium,
  },
  rowSubtitle: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  rowValue: {
    fontSize: 14,
    fontFamily: Fonts.regular,
  },
  primaryWrap: {
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: Radius.md,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 70,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Fonts.semibold,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    textAlign: "center",
    lineHeight: 20,
  },
});
