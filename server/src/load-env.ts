import { existsSync } from "fs";

if (existsSync(".env")) {
  process.loadEnvFile(".env");
}
