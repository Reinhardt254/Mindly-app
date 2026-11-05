const fs = require("fs");
const path = require("path");
const { withDangerousMod, AndroidConfig } = require("@expo/config-plugins");

function withSingleWidgetsModule(config) {
  return withDangerousMod(config, [
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
      }

      return nextConfig;
    },
  ]);
}

module.exports = withSingleWidgetsModule;
