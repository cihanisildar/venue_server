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
import axios from "axios";

export const authenticate: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    // Get tokens from cookies
    if (req.cookies) {
      accessToken = req.cookies.vn_auth_token;
      refreshToken = req.cookies.vn_refresh_token;
    }

    // If no tokens found, check Authorization header
    if (!accessToken) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        accessToken = authHeader.split(" ")[1];
      }
    }

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedError("Authentication required");
    }

    const JWT_ACCESS_SECRET = process.env.JWT_SECRET!; // Using the same secret as auth service

    async function refreshAccessToken(refreshToken: string) {
      try {
        const response = await axios.post(
          `${process.env.AUTH_SERVICE_URL}/auth/refresh`,
          {},
          {
            headers: {
              Cookie: `vn_refresh_token=${refreshToken}`,
            },
          }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data;

        // Set new cookies
        res.cookie("vn_auth_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie("vn_refresh_token", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return newAccessToken;
      } catch (error) {
        throw new UnauthorizedError("Failed to refresh token");
      }
    }

    try {
      if (!accessToken && refreshToken) {
        // If we only have refresh token, try to get a new access token
        accessToken = await refreshAccessToken(refreshToken);
      }

      const decoded = verify(accessToken!, JWT_ACCESS_SECRET) as TokenPayload;
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        reliabilityScore: decoded.reliabilityScore,
      };
      next();
    } catch (verifyError: unknown) {
      if (verifyError instanceof Error) {
        if (
          verifyError.name === "TokenExpiredError" &&
          refreshToken
        ) {
          try {
            // Token expired, try to refresh
            const newAccessToken = await refreshAccessToken(refreshToken);
            const decoded = verify(
              newAccessToken,
              JWT_ACCESS_SECRET
            ) as TokenPayload;
            req.user = {
              userId: decoded.userId,
              email: decoded.email,
              role: decoded.role,
              reliabilityScore: decoded.reliabilityScore,
            };
            next();
          } catch (refreshError) {
            throw new UnauthorizedError("Session expired. Please login again.");
          }
        } else if (verifyError.name === "JsonWebTokenError") {
          throw new UnauthorizedError("Invalid token");
        } else {
          throw new InternalServerError(
            "An error occurred during token verification"
          );
        }
      } else {
        throw new InternalServerError("An unexpected error occurred");
      }
    }
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Clear cookies on the client side
    res.clearCookie("vn_auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    
    res.clearCookie("vn_refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Notify auth service about logout
    try {
      await axios.post(
        `${process.env.AUTH_SERVICE_URL}/auth/logout`,
        {},
        {
          headers: {
            Cookie: `vn_refresh_token=${req.cookies.vn_refresh_token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error notifying auth service about logout:", error);
      // Continue with logout even if auth service notification fails
    }

    res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    next(error);
  }
};