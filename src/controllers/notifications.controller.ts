import { FieldPacket, QueryError, RowDataPacket } from "mysql2";
import { db } from "../app";
import { AuthRequest } from "../middleware/auth.middleware";
import { Response } from "express";

export const getNotifications = (req: AuthRequest, res: Response): void => {
  const userId = req.userId;
  const sql = "SELECT * FROM notification WHERE user_id =?";

  db.query(
    sql,
    [userId],
    (
      err: QueryError | null,
      result: RowDataPacket[],
      fields: FieldPacket[]
    ) => {
      if (err) {
        console.error("Error fetching reviews by cleaner id:", err);
        res.status(500).send("Server error");
        return;
      }
      res.status(200).json(result);
    }
  );
};
