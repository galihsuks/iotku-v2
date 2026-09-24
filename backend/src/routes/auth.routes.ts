import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import * as authController from "../modules/auth/auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", authController.login);
authRouter.post("/signup", authController.signup);
authRouter.get("/me", authenticate, authController.me);
authRouter.put("/profile", authenticate, authController.updateProfile);
authRouter.post("/logout", authenticate, authController.logout);
authRouter.put("/password", authenticate, authController.changePassword);
authRouter.post("/impersonate/:id", authenticate, authController.impersonate);
