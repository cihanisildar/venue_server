import { Response, NextFunction, RequestHandler } from "express";
import { verify } from "jsonwebtoken";
import { config } from "../../../config";
import { AuthenticatedRequest } from "../interfaces/auth.interface";

export const validateGatewayRequest: RequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Extract the gateway secret from the headers
  const gatewaySecret = req.header("X-Gateway-Secret");
  
  // Check if the gateway secret is valid
  if (gatewaySecret !== config.gateway.secret) {
    console.error("Unauthorized access - Invalid gateway secret");
    res.status(401).json({
      message: "Unauthorized - Direct access not allowed",
    });
    return;
  }

  // Only get token from cookies - don't accept Authorization header
  const token = req.cookies?.vn_auth_token;

  if (!token) {
    console.error("No authentication token found in cookies");
    res.status(401).json({
      message: "Unauthorized - Access token required",
    });
    return;
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined");
    res.status(500).json({
      message: "Internal server error - JWT secret is missing",
    });
    return;
  }

  try {
    // Verify the JWT token and extract user information
    const decoded = verify(token, JWT_SECRET) as { userId: string };
    
    if (!decoded || !decoded.userId) {
      console.error("Invalid token payload");
      res.status(401).json({
        message: "Unauthorized - Invalid token",
      });
      return;
    }

    // Set the user object from the verified JWT token only
    req.user = { userId: decoded.userId };
    
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({
      message: "Unauthorized - Invalid or expired token",
    });
  }
};