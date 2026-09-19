import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import * as controller from "../modules/system/role-menu-control/role-menu-control.controller.js";
export const roleMenuControlRouter = Router();
roleMenuControlRouter.use(authenticate);
roleMenuControlRouter.get("/:roleId", controller.listRoleAccess);
roleMenuControlRouter.post("/", controller.updateRoleAccess);
