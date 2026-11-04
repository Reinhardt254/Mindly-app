import { useColorScheme } from "@/hooks/useColorScheme";

export type PaletteColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  accentSoft: string;
  accentGradient: readonly [string, string, ...string[]];
  danger: string;
  dangerSoft: string;
  iconRing: string;
};

export const Palette: Record<"light" | "dark", PaletteColors> = {
  light: {
    background: "#F5F4FB",
    surface: "#FFFFFF",
    surfaceMuted: "#F0EEF8",
    text: "#1B1730",
    textMuted: "#8B87A1",
    border: "#ECEAF4",
    accent: "#7C5CFC",
    accentSoft: "#EEE9FF",
    accentGradient: ["#9B8AFB", "#7C5CFC", "#A855F7"],
    danger: "#E5484D",
    dangerSoft: "#FDECEC",
    iconRing: "#E6E3F0",
  },
  dark: {
    background: "#0E0C16",
    surface: "#191626",
    surfaceMuted: "#221E33",
    text: "#F4F2FA",
    textMuted: "#8F8AA6",
    border: "#2A2639",
    accent: "#9B87FF",
    accentSoft: "#2A2347",
    accentGradient: ["#8B7CF6", "#6D4AF0", "#9D4EDD"],
    danger: "#FF6369",
    dangerSoft: "#3A1C22",
    iconRing: "#332E47",
  },
};

export const Fonts = {
  regular: "DMSans_400Regular",
  medium: "DMSans_500Medium",
  semibold: "DMSans_600SemiBold",
  bold: "DMSans_700Bold",
};

export const Radius = {
  sm: 12,
  md: 16,
  lg: 22,
  pill: 999,
};

export function usePalette(): PaletteColors {
  const scheme = useColorScheme();
  return Palette[scheme ?? "light"];
}
