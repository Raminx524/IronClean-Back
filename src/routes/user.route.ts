import { Router } from "express";
import { getUserById, login, register, updateUser } from "../controllers/user.controller";
import { verifyToken } from "../middleware/auth.middleware";

const userRouter = Router();

userRouter.get("/", verifyToken, getUserById);
userRouter.post("/login", login);
userRouter.post("/register", register);
userRouter.put('/:id',verifyToken ,updateUser)

export default userRouter;
