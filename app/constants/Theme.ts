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
  /** Decorative icons on soft/light surfaces (brown in light, blue in dark). */
  iconAccent: string;
  accentGradient: readonly [string, string, ...string[]];
  danger: string;
  dangerSoft: string;
  iconRing: string;
};

export const Palette: Record<"light" | "dark", PaletteColors> = {
  light: {
    background: "#FAF6F4",
    surface: "#FFFFFF",
    surfaceMuted: "#F3E8E4",
    text: "#11181C",
    textMuted: "#7A746E",
    border: "#EDE4E0",
    accent: "#003049",
    accentSoft: "#e6cfc9",
    iconAccent: "#9A7268",
    accentGradient: ["#0A4A66", "#003049", "#001F2E"],
    danger: "#E5484D",
    dangerSoft: "#FDECEC",
    iconRing: "#E6CFC9",
  },
  dark: {
    background: "#0C0F14",
    surface: "#161B24",
    surfaceMuted: "#1E2633",
    text: "#F4F2FA",
    textMuted: "#9AA3B2",
    border: "#2A3342",
    accent: "#4A82F0",
    accentSoft: "#1A2F55",
    iconAccent: "#4A82F0",
    accentGradient: ["#0A4A66", "#003049", "#001F2E"],
    danger: "#FF6369",
    dangerSoft: "#3A1C22",
    iconRing: "#2A3F66",
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
