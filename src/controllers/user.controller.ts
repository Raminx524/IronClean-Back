import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth.middleware";
import { db } from "../app";
import { OkPacket, RowDataPacket } from 'mysql2';

dotenv.config();
const { JWT_SECRET } = process.env;
const SALT_ROUNDS = 10;

export const login = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE Username = ?";
    const [results]: any = await db.promise().query(sql, [username]);

    if (results.length === 0) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    const user = results[0];

    const isPasswordMatch = await bcrypt.compare(password, user.Password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }

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
  let {
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
    avatar_img,
  } = req.body;

  let responseSent = false; // Флаг для отслеживания отправки ответа

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const databaseName = "users";

    // Проверка наличия пользователя по имени пользователя
    let regValidate = `SELECT * FROM ${databaseName} WHERE Username = ?`;
    let [result]: any[] = await db.promise().query(regValidate, [username]);

    if (result.length > 0) {
      res.status(400).json({ error: "Username already exists" });
      responseSent = true;
    }

    if (!responseSent) {
      regValidate = `SELECT * FROM ${databaseName} WHERE Email = ?`;
      [result] = await db.promise().query(regValidate, [email]);

      if (result.length > 0) {
        res.status(400).json({ error: "Email already exists" });
        responseSent = true;
      }
    }

    if (!responseSent) {
      regValidate = `SELECT * FROM ${databaseName} WHERE Phone_number = ?`;
      [result] = await db.promise().query(regValidate, [phone_number]);

      if (result.length > 0) {
        res.status(400).json({ error: "Phone number already exists" });
        responseSent = true;
      }
    }

    if (!responseSent) {
      const userInsertQuery = `
        INSERT INTO users (Username, Password, First_name, Last_name, Email, Phone_number, role)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [userResult]: any = await db
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

      const userId = userResult.insertId;
      if (avatar_img) {
        const sqlAddImg = `UPDATE users SET avatar_img =? WHERE ID =?`;
        await db.promise().query(sqlAddImg, [avatar_img, userId]);
      } else {
        avatar_img = "https://i.pravatar.cc/150?img=" + userId;
        const sqlAddImg = `UPDATE users SET avatar_img = ? WHERE ID =?`;
        await db.promise().query(sqlAddImg, [avatar_img, userId]);
      }

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
    }
  } catch (err) {
    if (!responseSent) {
      console.error("Error registering user:", err);
      res.status(500).send("Server error");
    }
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const sql = `
      SELECT ID, Username, First_name, Last_name, Email, Phone_number, role, avatar_img
      FROM users 
      WHERE ID = ?;
    `;

    // Используем явное указание типа результата как RowDataPacket[]
    db.query<RowDataPacket[]>(sql, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching user by id:", err);
        return res.status(500).json({ error: "Failed to get user by id" });
      }
      console.log(err);

      if (results.length === 0) {
        return res
          .status(404)
          .json({ error: `User with ID ${userId} not found` });
      }

      const userWithoutPassword = results[0];
      res.status(200).json(userWithoutPassword);
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get user by id" });
  }
};
export const updateUser = async (req: Request, res: Response) => {
  const id = req.params.id;
  const {
    username,
    password,
    first_name,
    last_name,
    email,
    phone_number,
    role,
    avatar_img,
    // Role-specific fields
    address, // for clients
    price,   // for cleaners
    summary  // for cleaners
  } = req.body;

  // Input validation
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const updates = [];
  const values = [];

  if (username) {
    updates.push("Username = ?");
    values.push(username);
  }
  if (password) {
    updates.push("Password = ?");
    const hashedPassword = await bcrypt.hash(password, 10);
    values.push(hashedPassword);
  }
  if (first_name) {
    updates.push("First_name = ?");
    values.push(first_name);
  }
  if (last_name) {
    updates.push("Last_name = ?");
    values.push(last_name);
  }
  if (email) {
    updates.push("Email = ?");
    values.push(email);
  }
  if (phone_number) {
    updates.push("Phone_number = ?");
    values.push(phone_number);
  }
  if (role) {
    updates.push("role = ?");
    values.push(role);
  }
  if (avatar_img) {
    updates.push("avatar_img = ?");
    values.push(avatar_img);
  }

  try {
    // Start a transaction
    await db.promise().beginTransaction();

    // Update users table
    if (updates.length > 0) {
      const sql = `UPDATE users SET ${updates.join(", ")} WHERE ID = ?`;
      values.push(id);
      await db.promise().query(sql, values);
    }

    // Update role-specific tables
    if (role === "client") {
      if (address) {
        await db.promise().query<OkPacket>(
          'INSERT INTO clients (user_id, Address) VALUES (?, ?) ON DUPLICATE KEY UPDATE Address = ?',
          [id, address, address]
        );
      }
    } else if (role === "cleaner") {
      const cleanerUpdates = [];
      const cleanerValues = [];
      if (price !== undefined) {
        cleanerUpdates.push("Price = ?");
        cleanerValues.push(price);
      }
      if (summary) {
        cleanerUpdates.push("Summary = ?");
        cleanerValues.push(summary);
      }
      if (cleanerUpdates.length > 0) {
        const cleanerSql = `INSERT INTO cleaners (user_id, ${cleanerUpdates.join(", ")}) 
                            VALUES (?, ${cleanerUpdates.map(() => '?').join(", ")}) 
                            ON DUPLICATE KEY UPDATE ${cleanerUpdates.join(", ")}`;
        await db.promise().query<OkPacket>(cleanerSql, [id, ...cleanerValues, ...cleanerValues]);
      }
    }

    // Commit the transaction
    await db.promise().commit();

    // Fetch the updated user data
    const [userRows] = await db.promise().query<RowDataPacket[]>(
      'SELECT * FROM users WHERE ID = ?', 
      [id]
    );
    let updatedUser = userRows[0];

    // Fetch role-specific data
    if (role === "client") {
      const [clientRows] = await db.promise().query<RowDataPacket[]>(
        'SELECT * FROM clients WHERE user_id = ?', 
        [id]
      );
      updatedUser = { ...updatedUser, ...clientRows[0] };
    } else if (role === "cleaner") {
      const [cleanerRows] = await db.promise().query<RowDataPacket[]>(
        'SELECT * FROM cleaners WHERE user_id = ?', 
        [id]
      );
      updatedUser = { ...updatedUser, ...cleanerRows[0] };
    }

    res.status(200).json({
      message: "User updated successfully.",
      user: updatedUser
    });

  } catch (error) {
    // If there's an error, roll back the transaction
    await db.promise().rollback();
    console.error(error);
    res.status(500).json({ error: "Error updating user." });
  }
};