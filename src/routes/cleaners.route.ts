import { Router } from "express";
import { getAllCleaners, getCleanerById, getReservationsByCleanerId, getReviewsByCleanerId, } from "../controllers/cleaners.controller";
import { postReviwe } from "../controllers/reviwes.controllers";

const cleanersRoutes = Router();

cleanersRoutes.get("/", getAllCleaners);
cleanersRoutes.get('/:id', getCleanerById)
cleanersRoutes.get('/:id/reviwes', getReviewsByCleanerId) 
cleanersRoutes.get('/:id/reservations', getReservationsByCleanerId) 
cleanersRoutes.post('/:id/review', postReviwe)

export default cleanersRoutes;
