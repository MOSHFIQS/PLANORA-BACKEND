import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import path from "path";
import { AppModule } from "./app.module";
import { envVars } from "./config/env.config";

let cachedServer: any;

async function bootstrapServer() {
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
        callback(null, true);
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

  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  return cachedServer(req, res);
}

// Ensure compatibility with both CommonJS module.exports and ESM default export
if (typeof module !== "undefined" && module.exports) {
  module.exports = handler;
  module.exports.default = handler;
}
