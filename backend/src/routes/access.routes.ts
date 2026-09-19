import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import * as controller from "../modules/system/access/access.controller.js";
export const accessRouter = Router();
accessRouter.use(authenticate);
accessRouter.get("/menu", controller.accessMenu);
accessRouter.get("/control/:menuId", controller.accessControl);
