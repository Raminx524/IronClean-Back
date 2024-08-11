import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { MongoError } from "mongodb";
import { AuthRequest } from "../middleware/auth.middleware";
import { Error } from "mongoose";

dotenv.config();
const { JWT_SECRET } = process.env;
const SALT_ROUNDS = 10;

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET!, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

export const register = async (req: Request, res: Response) => {
  console.log("register");
  try {
    const { username, password, email } = req.body;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ username, email, password: hashedPassword });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    const err = error as MongoError;
    console.log("register", err.name);
    if (err.code === 11000) {
      console.log("username already exists");
      return res.status(400).json({ error: "User already exists" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById({ _id: req.userId }).lean();
    if (!user) {
      throw new Error(`User ${req.userId}`);
    }
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Failed to get user by id" });
  }
};
