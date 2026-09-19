import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import * as controller from "../modules/system/log/log.controller.js";
export const logRouter = Router();
logRouter.post("/", controller.createLog);
logRouter.use(authenticate);
logRouter.get("/", controller.listLogs);
logRouter.delete("/", controller.clearLogs);
