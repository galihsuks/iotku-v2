import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import * as sensorController from "../modules/sensor/sensor/sensor.controller.js";
import * as sensorReadingController from "../modules/sensor/reading/sensor-reading.controller.js";
import * as sensorUnitController from "../modules/sensor/unit/sensor-unit.controller.js";

export const sensorRouter = Router();

sensorRouter.post("/:id/readings/public", sensorReadingController.createReading);
sensorRouter.use(authenticate);
sensorRouter.get("/units", sensorUnitController.listUnits);
sensorRouter.post("/units", sensorUnitController.createUnit);
sensorRouter.put("/units/:id", sensorUnitController.updateUnit);
sensorRouter.delete("/units/:id", sensorUnitController.deleteUnit);
sensorRouter.get("/", sensorController.listSensors);
sensorRouter.post("/", sensorController.createSensor);
sensorRouter.post("/join", sensorController.joinSensor);
sensorRouter.get("/:id", sensorController.getSensor);
sensorRouter.put("/:id", sensorController.updateSensor);
sensorRouter.delete("/:id", sensorController.deleteSensor);
sensorRouter.get("/:id/readings", sensorReadingController.listReadings);
sensorRouter.post("/:id/readings", sensorReadingController.createReading);
