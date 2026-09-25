import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import * as controller from "../modules/system/websocket-log/websocket-log.controller.js";

export const websocketLogRouter = Router();

websocketLogRouter.use(authenticate);
websocketLogRouter.get("/", controller.listLogs);
websocketLogRouter.delete("/", controller.clearLogs);
