import { Response, NextFunction, RequestHandler } from "express";
import { verify, JwtPayload } from "jsonwebtoken";
import { AuthenticatedRequest } from "../interfaces/auth.interface";
import { UnauthorizedError } from "../../common/errors/custom.error";

interface TokenPayload extends JwtPayload {
  userId: string;
  role?: string;
  sessionId?: string;
}

export const authenticate: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extract token from cookies only
    const token = req.cookies?.vn_auth_token;

    if (!token) {
      throw new UnauthorizedError("No authentication token provided");
    }

    // 2. Verify and decode the token
    const decoded = verify(token, process.env.JWT_SECRET!) as TokenPayload;

    // 3. Validate token payload
    if (!decoded || !decoded.userId) {
      throw new UnauthorizedError("Invalid token payload");
    }

    // 4. Check token expiration with some buffer time (30 seconds)
    const bufferTime = 30; // seconds
    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.exp && decoded.exp - bufferTime < currentTime) {
      throw new UnauthorizedError("Token is about to expire");
    }

    // 5. Optional: Check if token is blacklisted (for logged out tokens)
    // await checkTokenBlacklist(token);

    // 6. Set user information in request
    req.user = {
      userId: decoded.userId,
      // role: decoded.role,         // If you use roles
      // sessionId: decoded.sessionId // If you use session tracking
    };

    // 7. Set security headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");

    next();
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      res.status(401).json({ message: error.message });
      return;
    }

    // Handle specific JWT errors
    if (error instanceof Error) {
      switch (error.name) {
        case "TokenExpiredError":
          res.status(401).json({ message: "Token has expired" });
          break;
        case "JsonWebTokenError":
          res.status(401).json({ message: "Invalid token" });
          break;
        default:
          res.status(500).json({ message: "Internal authentication error" });
      }
      return;
    }

    res.status(500).json({ message: "Internal authentication error" });
  }
};
