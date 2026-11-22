import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe, Logger } from "@nestjs/common";
import cookieParser from "cookie-parser";
import path from "path";
import { AppModule } from "./app.module";
import { envVars } from "./config/env.config";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  // Disable NestJS's built-in body parser as required by @thallesp/nestjs-better-auth
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  // Configure view engine for EJS (OAuth redirects & email templates)
  app.setBaseViewsDir(path.resolve(process.cwd(), "src/mail/templates"));
  app.setViewEngine("ejs");

  // Cookie Parser
  app.use(cookieParser());

  // CORS configuration
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        envVars.FRONTEND_URL,
        envVars.PROD_CLIENT_URL,
        envVars.BETTER_AUTH_URL,
        "localhost:3000",
        "localhost:5000",
        "http://localhost:3000",
        "http://localhost:5000",
        "http://localhost:5001",
        "localhost:5001",
        "http://localhost:5002",
        "localhost:5002",
        "http://localhost:3001",
        "localhost:3001",
        "http://localhost:3002",
        "localhost:3002",
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
  });

  // Global API Prefix for application controllers, excluding Better Auth (/api/auth) and root
  app.setGlobalPrefix("api/v1", {
    exclude: ["api/auth/{*path}", "api/auth", "/"],
  });

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    })
  );

  const port = envVars.PORT || 5000;
  await app.listen(port);
  logger.log(`Server is running on http://localhost:${port}`);
  logger.log(`API v1 prefix is active at http://localhost:${port}/api/v1`);
  logger.log(`Better Auth endpoints mounted at http://localhost:${port}/api/auth`);
}

bootstrap().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});
