import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
// import Business from "../models/Business";
import dotenv from "dotenv";

dotenv.config();

const { JWT_SECRET } = process.env;

export interface AuthRequest extends Request {
  userId?: string;
}

interface DecodedToken {
  userId: string;
}
function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.header("Authorization") || req.header("authorization");
  console.log(authHeader);
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied" });
  }

  let token = authHeader;
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  }

  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken; // Verify token
    req.userId = decoded.userId; // Add userId to request object

    next(); // Call next middleware
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Invalid token" });
  }
}
// async function authorizeBusinessOwner(
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) {
//   const { id: businessId } = req.params;
//   try {
//     const business = await Business.findById(businessId);
//     if (!business) {
//       return res.status(404).json({ message: "Business not found" });
//     }

//     if (business.user.toString() !== req.userId) {
//       return res.status(403).json({ message: "User not authorized" });
//     }

//     next();
//   } catch (error) {
//     console.error("Error while authorizing business owner", error);
//     res.status(500).json({ message: "Server error" });
//   }
// }

export { verifyToken };
