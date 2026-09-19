import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import * as controller from "../modules/system/menu-control/menu-control.controller.js";
export const menuControlRouter = Router();
menuControlRouter.use(authenticate);
menuControlRouter.get("/:menuId", controller.listMenuControls);
menuControlRouter.post("/", controller.createMenuControl);
menuControlRouter.put("/:id", controller.updateMenuControl);
menuControlRouter.delete("/:id", controller.deleteMenuControl);
