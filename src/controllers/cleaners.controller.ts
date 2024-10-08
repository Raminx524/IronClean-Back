import { db } from "../app";
import { Request, Response } from "express";
import { RowDataPacket, QueryError, FieldPacket } from "mysql2";
import { AuthRequest } from "../middleware/auth.middleware";

export const getAllCleaners = (req: Request, res: Response): void => {
  const sql = `
    SELECT users.ID, Username, role, First_name, Last_name, Email, Phone_number,avatar_img ,cleaners.user_id, Price, Summary, AVG(reviews.Rating) as avg_rating
    FROM cleaners 
    JOIN users ON users.ID = cleaners.user_id 
    LEFT JOIN reviews ON reviews.Posted_ID = users.ID
    WHERE users.role = "cleaner"
    GROUP BY users.ID;
  `;

  db.query(
    sql,
    (
      err: QueryError | null,
      results: RowDataPacket[],
      fields: FieldPacket[]
    ) => {
      if (err) {
        console.error("Error fetching cleaners:", err);
        res.status(500).send("Server error");
        return;
      }
      res.status(200).json(results);
    }
  );
};

export const getCleanerById = (req: Request, res: Response): void => {
  const id = req.params.id;
  const sql = `
    SELECT users.ID,avatar_img, Username, role, First_name, Last_name, Email, Phone_number, cleaners.user_id, Price, Summary, AVG(reviews.Rating) as avg_rating
    FROM cleaners 
    JOIN users ON users.ID = cleaners.user_id 
    LEFT JOIN reviews ON reviews.Posted_ID = users.ID
    WHERE users.role = "cleaner" AND user_id = ?
    GROUP BY users.ID;
  `;

  db.query(
    sql,
    [id],
    (
      err: QueryError | null,
      result: RowDataPacket[],
      fields: FieldPacket[]
    ) => {
      if (err) {
        console.error("Error fetching cleaner by id:", err);
        res.status(500).send("Server error");
        return;
      }
      if (result.length === 0) {
        res.status(404).send("Cleaner not found");
        return;
      }
      res.status(200).json(result[0]);
    }
  );
};

export const getReviewsByCleanerId = (req: Request, res: Response): void => {
  const id = req.params.id;
  const sql = `
    SELECT reviews.*,users.Username,users.avatar_img FROM reviews 
    JOIN users ON users.ID=reviews.Poster_ID
    WHERE Posted_ID = ?;
  `;
  db.query(
    sql,
    [id],
    (
      err: QueryError | null,
      results: RowDataPacket[],
      fields: FieldPacket[]
    ) => {
      if (err) {
        console.error("Error fetching reviews by cleaner id:", err);
        res.status(500).send("Server error");
        return;
      }
      res.status(200).json(results);
    }
  );
};

export const getReservationsByCleanerId = (
  req: Request,
  res: Response
): void => {
  const id = req.params.id;
  const sql = `
    SELECT reservations.*
    FROM reservations
    LEFT JOIN reviews ON reviews.Posted_ID = reservations.cleaner_id
    WHERE cleaner_id = ?
  `;
  db.query(
    sql,
    [id],
    (
      err: QueryError | null,
      results: RowDataPacket[],
      fields: FieldPacket[]
    ) => {
      if (err) {
        console.error("Error fetching reservations by cleaner id:", err);
        res.status(500).send("Server error");
        return;
      }
      res.status(200).json(results);
    }
  );
};
export const getDaysById = (req: Request, res: Response): void => {
  const id = req.params.id;
  const sql = `SELECT Days FROM days WHERE id IN (
    SELECT Day_ID 
    FROM work_days
    WHERE User_ID = ?)
  `;

  db.query(
    sql,
    [id],
    (
      err: QueryError | null,
      results: RowDataPacket[],
      fields: FieldPacket[]
    ) => {
      if (err) {
        console.error("Error fetching days by cleaner id:", err);
        res.status(500).send("Server error");
        return;
      }

      // Transform the results into an array of strings
      const days = results.map((row: RowDataPacket) => row.Days);

      res.status(200).json(days);
    }
  );
};

export const getReservationsByDate = (req: Request, res: Response): void => {
  const { date } = req.query;
  const id = req.params.id;
  const sql = `select Start_time, End_time from reservations where Cleaner_ID= ? and date = ?`;
  console.log(date);

  db.query(
    sql,
    [id, date],
    (
      err: QueryError | null,
      results: RowDataPacket[],
      fields: FieldPacket[]
    ) => {
      if (err) {
        console.error("Error fetching reservations by date:", err);
        res.status(500).send("Server error");
        return;
      }
      res.status(200).json(results);
    }
  );
};

export const get5TopCleaners = (req: Request, res: Response): void => {
  const sql = `
    SELECT users.ID,avatar_img, Username, role, First_name, Last_name, Email, Phone_number, cleaners.Price, AVG(reviews.Rating) as avg_rating 
    FROM users 
    JOIN cleaners ON users.ID = cleaners.user_id 
    LEFT JOIN reviews ON reviews.Posted_ID = users.ID 
    WHERE users.role = "cleaner" 
    GROUP BY users.ID 
    ORDER BY avg_rating DESC 
    LIMIT 5;
  `;

  db.query(
    sql,
    (
      err: QueryError | null,
      results: RowDataPacket[],
      fields: FieldPacket[]
    ) => {
      if (err) {
        console.error("Error fetching top 5 cleaners:", err);
        res.status(500).send("Server error");
        return;
      }
      res.status(200).json(results);
    }
  );
};
export const addReservation = (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { id: cleaner_id } = req.params;
  const { start_time, end_time, date } = req.body;

  const sql = `
    INSERT INTO reservations (cleaner_id, client_id, start_time, end_time, date)
    VALUES (?, ?, ?, ?, ?);
  `;
  console.log(
    { cleaner_id },
    { userId },
    { start_time },
    { end_time },
    { date }
  );

  db.query(
    sql,
    [cleaner_id, userId, start_time, end_time, date],
    (
      err: QueryError | null,
      results: RowDataPacket[],
      fields: FieldPacket[]
    ) => {
      if (err) {
        console.error("Error adding reservation:", err);
        res.status(500).send("Server error");
        return;
      }

      res.status(201).send("Reservation added successfully");
    }
  );
};
