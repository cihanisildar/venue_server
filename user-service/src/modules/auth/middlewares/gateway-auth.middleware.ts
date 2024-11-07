import { Response, NextFunction, RequestHandler } from "express";
import { config } from "../../../config";
import { AuthenticatedRequest } from "../interfaces/auth.interface";

export const validateGatewayRequest: RequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  console.log("Request headers:", req.headers);

  // Extract the gateway secret from the headers
  const gatewaySecret = req.header("X-Gateway-Secret");
  console.log("Received X-Gateway-Secret:", gatewaySecret);

  // Check if the gateway secret is valid
  if (gatewaySecret !== config.gateway.secret) {
    console.error("Unauthorized access - Invalid gateway secret");
    res.status(401).json({
      message: "Unauthorized - Direct access not allowed",
    });
    return; // Ensure to return here to stop further execution
  }

  // Check for the x-user-id header
  const userId = req.header("x-user-id");
  if (!userId) {
    console.error("Unauthorized access - Missing x-user-id header");
    res.status(401).json({
      message: "Unauthorized - User ID required",
    });
    return; // Ensure to return here to stop further execution
  }

  // Check for the Authorization header
  // const authHeader = req.header("Authorization");
  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   console.error("Unauthorized access - Missing or invalid Authorization header");
  //   res.status(401).json({
  //     message: "Unauthorized - Access token required",
  //   });
  //   return; // Ensure to return here to stop further execution
  // }

  // If all checks pass, proceed to the next middleware
  next(); // Call next without returning anything
};