const appJson = require("./app.json");

/** @type {import('expo/config').ExpoConfig} */
const expo = { ...appJson.expo };

const iosUrlScheme = process.env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME?.trim();
const plugins = [...(expo.plugins ?? [])];

// iOS needs a reversed client ID URL scheme. Android autolinks without this plugin.
if (iosUrlScheme) {
  plugins.push([
    "@react-native-google-signin/google-signin",
    { iosUrlScheme },
  ]);
}

expo.plugins = plugins;

module.exports = { expo };
