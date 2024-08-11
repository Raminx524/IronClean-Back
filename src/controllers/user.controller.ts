import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { MongoError } from "mongodb";
import { AuthRequest } from "../middleware/auth.middleware";
import { Error } from "mongoose";
import { db } from "../app";

dotenv.config();
const { JWT_SECRET } = process.env;
const SALT_ROUNDS = 10;

export const login = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { username, password } = req.body;

    // Поиск пользователя по имени пользователя в базе данных
    const sql = "SELECT * FROM users WHERE Username = ?";
    const [results]: any = await db.promise().query(sql, [username]);

    if (results.length === 0) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const user = results[0];

    // Проверка пароля
    const isPasswordMatch = await bcrypt.compare(password, user.Password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Генерация JWT-токена
    const token = jwt.sign({ userId: user.ID }, JWT_SECRET!, {
      expiresIn: "1h",
    });

    return res.status(200).json({ token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Login failed" });
  }
};

// export const login = async (req: Request, res: Response) => {
//   try {
//     const { username, password } = req.body;

//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(401).json({ error: "Authentication failed" });
//     }

//     const isPasswordMatch = await bcrypt.compare(password, user.password);
//     if (!isPasswordMatch) {
//       return res.status(401).json({ error: "Authentication failed" });
//     }

//     const token = jwt.sign({ userId: user._id }, JWT_SECRET!, {
//       expiresIn: "1h",
//     });

//     res.status(200).json({ token });
//   } catch (error) {
//     res.status(500).json({ error: "Login failed" });
//   }
// };

export const register = async (req: Request, res: Response): Promise<void> => {
  const {
    username,
    password,
    first_name,
    last_name,
    email,
    phone_number,
    role,
    address,
    price,
    summary,
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userInsertQuery = `
      INSERT INTO users (Username, Password, First_name, Last_name, Email, Phone_number, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const userResult: any = await db
      .promise()
      .query(userInsertQuery, [
        username,
        hashedPassword,
        first_name,
        last_name,
        email,
        phone_number,
        role,
      ]);

    const userId = userResult[0].insertId;

    if (role === "client") {
      const clientInsertQuery = `
        INSERT INTO clients (user_id, Address)
        VALUES (?, ?)
      `;
      await db.promise().query(clientInsertQuery, [userId, address]);
    } else if (role === "cleaner") {
      const cleanerInsertQuery = `
        INSERT INTO cleaners (user_id, Price, Summary)
        VALUES (?, ?, ?)
      `;
      await db.promise().query(cleanerInsertQuery, [userId, price, summary]);
    }

    res.status(201).send("User registered successfully");
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).send("Server error");
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  // try {
  //   const user = await User.findById({ _id: req.userId }).lean();
  //   if (!user) {
  //     throw new Error(`User ${req.userId}`);
  //   }
  //   const { password, ...userWithoutPassword } = user;
  //   res.status(200).json(userWithoutPassword);
  // } catch (error) {
  //   res.status(500).json({ error: "Failed to get user by id" });
  // }
};
