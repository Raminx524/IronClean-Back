import { db } from "../app";
import { Request, Response } from "express";

export const getAllCleaners = (req: Request, res: Response): void => {
  const sql =
    'SELECT * FROM cleaners JOIN users ON users.ID = cleaners.user_id WHERE users.role = "cleaner";';

  db.query(sql, (err: Error, results: any[]) => {
    if (err) {
      console.error("Error fetching cleaners:", err);
      res.status(500).send("Server error");
      return;
    }
    res.status(200).json(results);
  });
};
