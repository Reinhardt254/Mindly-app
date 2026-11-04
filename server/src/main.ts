import "./load-env";
import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { env } from "./config/env";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.enableShutdownHooks();
  await app.listen(env.PORT, "0.0.0.0");
  Logger.log(`Moodly API listening on :${env.PORT}`, "Bootstrap");
}

bootstrap();
