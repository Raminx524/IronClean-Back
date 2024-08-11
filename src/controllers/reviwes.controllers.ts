import { db } from "../app";
import { Request, Response } from "express";
import { RowDataPacket, QueryError, FieldPacket } from "mysql2";
export const postReviwe = (req: Request, res: Response) => {
    const { Poster_ID, Posted_ID, Rating, Text } = req.body;
    const sql = `INSERT INTO reviews (Poster_ID, Posted_ID, Rating, Text) VALUES (${Poster_ID}, ${Posted_ID}, ${Rating}, "${Text}");`;
    db.query(sql, (err: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]) => {
        if (err) {
            console.error("Error posting review:", err);
            res.status(500).send("Server error");
            return;
        }
        res.send("Review posted successfully");
    });
}
export const deleteReview = (req: Request, res: Response) => {
    const { revId } = req.params;
    const sql = `DELETE FROM reviews WHERE id =?;`;
    db.query(sql, [revId], (err: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]) => {
        if (err) {
            console.error("Error deleting review:", err);
            res.status(500).send("Server error");
            return;
        }
        res.send("Review deleted successfully");
    });

 }