const fs = require("fs");
const path = require("path");
const { withFinalizedMod, AndroidConfig } = require("@expo/config-plugins");

function withSingleWidgetsModule(config) {
  // expo-widgets writes Module.kt from a dangerous mod. Those mods run in
  // reverse plugin order, so a later dangerous mod deletes the file and then
  // expo-widgets writes it back. Finalized mods run after that write.
  return withFinalizedMod(config, [
    "android",
    async (nextConfig) => {
      const packageName = AndroidConfig.Package.getPackage(nextConfig);
      if (!packageName) return nextConfig;

      const modulePath = path.join(
        nextConfig.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "java",
        ...packageName.split("."),
        "Module.kt"
      );

      if (!fs.existsSync(modulePath)) return nextConfig;

      const contents = fs.readFileSync(modulePath, "utf8");
      if (contents.includes("class ExpoWidgetsModule")) {
        fs.unlinkSync(modulePath);
        console.log("Removed duplicate ExpoWidgetsModule from", modulePath);
      }

      return nextConfig;
    },
  ]);
}

module.exports = withSingleWidgetsModule;
