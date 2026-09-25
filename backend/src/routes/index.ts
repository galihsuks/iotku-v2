import { Router } from "express";
import { accessRouter } from "./access.routes.js";
import { authRouter } from "./auth.routes.js";
import { dropdownRouter } from "./dropdown.routes.js";
import { logRouter } from "./log.routes.js";
import { menuControlRouter } from "./menu-control.routes.js";
import { menuRouter } from "./menu.routes.js";
import { parameterRouter } from "./parameter.routes.js";
import { roleMenuControlRouter } from "./role-menu-control.routes.js";
import { roleRouter } from "./role.routes.js";
import { sensorRouter } from "./sensor.routes.js";
import { userRouter } from "./user.routes.js";
import { websocketLogRouter } from "./websocket-log.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/access", accessRouter);
apiRouter.use("/dropdown", dropdownRouter);
apiRouter.use("/log", logRouter);
apiRouter.use("/menu", menuRouter);
apiRouter.use("/menu-control", menuControlRouter);
apiRouter.use("/parameter", parameterRouter);
apiRouter.use("/role", roleRouter);
apiRouter.use("/role-menu-control", roleMenuControlRouter);
apiRouter.use("/sensor", sensorRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/websocket-log", websocketLogRouter);
