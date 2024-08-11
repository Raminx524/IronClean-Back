import { Router } from "express";
import { addReservation, get5TopCleaners, getAllCleaners, getCleanerById, getReservationsByCleanerId, getReviewsByCleanerId, } from "../controllers/cleaners.controller";
import { deleteReview, postReviwe } from "../controllers/reviwes.controllers";
import { verifyToken } from "../middleware/auth.middleware";

const cleanersRoutes = Router();

cleanersRoutes.get("/", getAllCleaners);
cleanersRoutes.get('/top', get5TopCleaners);
cleanersRoutes.get('/:id', getCleanerById)
cleanersRoutes.get('/:id/reviews', getReviewsByCleanerId) 
cleanersRoutes.get('/:id/reservations', getReservationsByCleanerId) 
cleanersRoutes.post('/:id/reservations', addReservation)
cleanersRoutes.post('/:id/review', postReviwe)
cleanersRoutes.delete('/:id/review/:revId',verifyToken ,deleteReview)

export default cleanersRoutes;
