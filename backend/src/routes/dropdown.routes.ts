import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import * as controller from "../modules/system/dropdown/dropdown.controller.js";
export const dropdownRouter = Router();
dropdownRouter.use(authenticate);
dropdownRouter.get("/role", controller.dropdownRoles);
dropdownRouter.get("/user", controller.dropdownUsers);
