import { Router } from "express";
import { getUserById, login, register } from "../controllers/user.controller";
import { verifyToken } from "../middleware/auth.middleware";

const userRouter = Router();

userRouter.get("/", verifyToken, getUserById);
userRouter.post("/login", login);
userRouter.post("/register", register);

export default userRouter;
