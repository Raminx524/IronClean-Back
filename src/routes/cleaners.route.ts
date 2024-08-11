import { Router } from "express";
import { getAllCleaners } from "../controllers/cleaners.controller";

const cleanersRoutes = Router();

cleanersRoutes.get("/", getAllCleaners);

export default cleanersRoutes;
