import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { openApiDocument } from "./docs/openapi.js";
import { errorHandler, success } from "./utils/http.js";
import { apiAuditLogger } from "./middleware/api-audit-logger.js";
import { requestContext } from "./middleware/request-context.js";
import { apiRouter } from "./routes/index.js";

export const createApp = () => {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(requestContext);

  app.get("/", (_req, res) => success(res, `API ${env.APP_NAME}`));
  app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use(apiAuditLogger);
  app.use("/api", apiRouter);
  app.use(errorHandler);

  return app;
};
