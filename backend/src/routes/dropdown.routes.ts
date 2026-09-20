import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import * as controller from "../modules/dropdown/dropdown.controller.js";

export const dropdownRouter = Router();

dropdownRouter.use(authenticate);
dropdownRouter.get("/role", controller.dropdownRoles);
dropdownRouter.get("/sensor", controller.dropdownSensors);
dropdownRouter.get("/sensor-unit", controller.dropdownSensorUnits);
dropdownRouter.get("/user", controller.dropdownUsers);
