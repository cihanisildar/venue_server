import { NextFunction, RequestHandler, Response } from "express";
import { verify } from "jsonwebtoken";
import { AuthenticatedRequest, TokenPayload } from "../interfaces/auth.interface";

export const authenticate: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as TokenPayload;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      reliabilityScore: decoded.reliabilityScore,
    };

    next();
  } catch (error) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Token expired" });
      return;
    }
    if (error instanceof Error && error.name === "JsonWebTokenError") {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    next(error);
  }
};
