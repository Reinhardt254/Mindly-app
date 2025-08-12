/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#cddad1";
const tintColorDark = "#fff";

const backgroundColorLight = "#cddad1";
const backgroundColorDark = "#000";

// Gradient colors for light mode
export const gradientColorsLight = ["#fcfcfc", "#cddad1",  "#cddad1"];
export const gradientColorsDark = ["#000000"];

export const Colors = {
  light: {
    text: "#11181C",
    background: backgroundColorLight,
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#000",
    tabbarBackground: "#cddad1",
  },
  dark: {
    text: "#ECEDEE",
    background: backgroundColorDark,
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    tabbarBackground: "#000000",
  },
};
