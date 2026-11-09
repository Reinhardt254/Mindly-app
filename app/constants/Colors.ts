/**
 * Colors used across the app for light and dark mode.
 */

const tintColorLight = "#e6cfc9";
const tintColorDark = "#fff";

const backgroundColorLight = "#faf6f4";
const backgroundColorDark = "#000";

// Gradient colors for light mode (matches Moodly logo background)
export const gradientColorsLight = ["#faf6f4", "#f0e2dc", "#e6cfc9"];
export const gradientColorsDark = ["#000000", "#000000", "#000000"];

export const Colors = {
  light: {
    text: "#11181C",
    background: backgroundColorLight,
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#003049",
    tabbarBackground: "#ffffff",
    tabbarText: "#000000",
    sidebarBackground: "#ffffff",
    quoteText: "#ffffff",
    highlight: "#003049",
  },
  dark: {
    text: "#ECEDEE",
    background: backgroundColorDark,
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#4A82F0",
    tabbarBackground: "#000000",
    tabbarText: "#fff",
    sidebarBackground: "#000000",
    quoteText: "#ffffff",
    highlight: "#4A82F0",
  },
};
