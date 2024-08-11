import { db } from "../app";
import { Request, Response } from "express";
import { RowDataPacket, QueryError, FieldPacket } from "mysql2";

export const getAllCleaners = (req: Request, res: Response): void => {
  const sql = 'SELECT * FROM cleaners JOIN users ON users.ID = cleaners.user_id WHERE users.role = "cleaner";';

  db.query(sql, (err: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]) => {
    if (err) {
      console.error("Error fetching cleaners:", err);
      res.status(500).send("Server error");
      return;
    }
    res.status(200).json(results);
  });
};

export const getCleanerById = (req: Request, res: Response): void => {
  const id = req.params.id;
  const sql = `SELECT * FROM cleaners JOIN users ON users.ID = cleaners.user_id WHERE users.role = "cleaner" AND user_id = ?;`;

  db.query(sql, [id], (err: QueryError | null, result: RowDataPacket[], fields: FieldPacket[]) => {
    if (err) {
      console.error('Error fetching cleaner by id:', err);
      res.status(500).send('Server error');
      return;
    }
    if (result.length === 0) {
      res.status(404).send('Cleaner not found');
      return;
    }
    res.status(200).json(result[0]);
  });
};

export const getReviewsByCleanerId = (req: Request, res: Response): void => {
  const id = req.params.id;
  const sql = `SELECT * FROM reviews WHERE Posted_ID =?;`;
  db.query(sql, [id], (err: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]) => {
    if (err) {
      console.error('Error fetching reviews by cleaner id:', err);
      res.status(500).send('Server error');
      return;
    }
    res.status(200).json(results);
  });
}

export const getReservationsByCleanerId = (req: Request, res: Response): void => {
  const id = req.params.id;
  const sql = `SELECT * FROM reservations WHERE cleaner_id =?;`;
  db.query(sql, [id], (err: QueryError | null, results: RowDataPacket[], fields: FieldPacket[]) => {
    if (err) {
      console.error('Error fetching reservations by cleaner id:', err);
      res.status(500).send('Server error');
      return;
    }
    res.status(200).json(results);
  });
}