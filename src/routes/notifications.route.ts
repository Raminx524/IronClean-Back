import { Router } from "express";

import { verifyToken } from "../middleware/auth.middleware";
import { getNotifications } from "../controllers/notifications.controller";

const notificationRouter = Router();
notificationRouter.get("/", verifyToken, getNotifications);
// userRouter.get("/", verifyToken, getUserById);
// userRouter.post("/login", login);
// userRouter.post("/register", register);

export default notificationRouter;
