const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// The NestJS API lives in /server with its own node_modules; keep it out of the bundle.
const serverDir = path.resolve(__dirname, "server").replace(/[/\\]/g, "[/\\\\]");
config.resolver.blockList = [
  ...[].concat(config.resolver.blockList ?? []),
  new RegExp(`^${serverDir}[/\\\\].*`),
];

module.exports = config;
