/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#cddad1";
const tintColorDark = "#fff";

const backgroundColorLight = "#f9f9f9";
const backgroundColorDark = "#000";

// Gradient colors for light mode
export const gradientColorsLight = ["#fcfcfc", "#fcfcfc",  "#cddad1"];
export const gradientColorsDark = ["#000000", "#000000", "#000000"];
 
export const Colors = {
  light: {
    text: "#11181C",
    background: backgroundColorLight,
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#000",
    tabbarBackground: "#ffffff",
    tabbarText: "#000000",
    sidebarBackground: "#ffffff",
    quoteText: "#ffffff",
    highlight: "#279089",
  },
  dark: {
    text: "#ECEDEE",
    background: backgroundColorDark,
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    tabbarBackground: "#000000",
    tabbarText: "#fff",
    sidebarBackground: "#000000",
    quoteText: "#ffffff",
    highlight: "#279089",
  },
};
