import { Router } from "express";
import {
  get5TopCleaners,
  getAllCleaners,
  getCleanerById,
  getDaysById,
  getReservationsByCleanerId,
  getReservationsByDate,
  getReviewsByCleanerId,
} from "../controllers/cleaners.controller";
import { deleteReview, postReviwe } from "../controllers/reviwes.controllers";
import { verifyToken } from "../middleware/auth.middleware";

const cleanersRoutes = Router();

cleanersRoutes.get("/", getAllCleaners);
cleanersRoutes.get("/top", get5TopCleaners);
cleanersRoutes.get("/:id", getCleanerById);
cleanersRoutes.get("/:id/reviews", getReviewsByCleanerId);
cleanersRoutes.get("/:id/reservations", getReservationsByCleanerId);
cleanersRoutes.get("/:id/reservations/reserv", getReservationsByDate);
cleanersRoutes.get("/:id/days", getDaysById);
cleanersRoutes.post("/:id/review", postReviwe);
cleanersRoutes.delete("/:id/review/:revId", verifyToken, deleteReview);

export default cleanersRoutes;
