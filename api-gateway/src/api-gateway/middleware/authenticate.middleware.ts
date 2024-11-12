import { NextFunction, RequestHandler, Response } from "express";
import { verify } from "jsonwebtoken";
import {
  AuthenticatedRequest,
  TokenPayload,
} from "../interfaces/auth.interface";
import {
  InternalServerError,
  UnauthorizedError,
} from "../../common/errors/custom.error";

export const authenticate: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let accessToken: string | undefined;

    // Get tokens from cookies or headers
    if (req.cookies) {
      accessToken = req.cookies.vn_auth_token;
    }

    // Check headers for tokens
    if (!accessToken) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        accessToken = authHeader.split(" ")[1];
      }
    }

    if (!accessToken) {
      throw new UnauthorizedError("Authentication required");
    }

    const JWT_ACCESS_SECRET = process.env.JWT_SECRET;
    if (!JWT_ACCESS_SECRET) {
      console.error("JWT_SECRET is not defined");
      throw new InternalServerError("JWT secret is not configured");
    }

    // Verify the access token
    try {
      const decoded = verify(accessToken, JWT_ACCESS_SECRET) as TokenPayload;
      req.user = decoded; // Attach decoded user data to the request
      next();
    } catch (error) {
      // Handle invalid or expired token
      throw new UnauthorizedError("Invalid or expired token");
    }
  } catch (error) {
    next(error);
  }
};
