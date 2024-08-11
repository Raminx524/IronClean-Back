import express, { Application } from "express";
import userRoutes from "./routes/user.route";
import connectDB from "./config/db";
import cors from "cors";
import path from "path";
import mysql2 from "mysql2";
import cleanersRoutes from "./routes/cleaners.route";
import dotenv from "dotenv";

dotenv.config();
const app: Application = express();

export const db = mysql2.createConnection({
  host: "127.0.0.1",
  user: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
});

async function main() {
  app.use(express.json());
  app.use(cors({}));

  db.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL database");

    // app.use("/api/user", userRoutes);

    app.use("/api/cleaners", cleanersRoutes);
  });
}

main();

export default app;
