const fs = require("fs");
const path = require("path");

const appRoot = path.join(__dirname, "..");
const source = path.join(appRoot, "native", "ExpoWidgetsModule.kt");
const androidRoot = path.join(
  appRoot,
  "node_modules",
  "@bittingz",
  "expo-widgets",
  "android"
);

function findModule(dir) {
  if (!fs.existsSync(dir)) return null;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findModule(fullPath);
      if (found) return found;
    } else if (entry.name === "ExpoWidgetsModule.kt") {
      return fullPath;
    }
  }
  return null;
}

if (!fs.existsSync(androidRoot)) {
  process.exit(0);
}

const target = findModule(androidRoot);
if (!target) {
  console.error("Could not find @bittingz/expo-widgets ExpoWidgetsModule.kt to patch.");
  process.exit(1);
}

fs.copyFileSync(source, target);
console.log("Patched", path.relative(appRoot, target));
