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

    // Get tokens from cookies or headers
    if (req.cookies) {
      accessToken = req.cookies.vn_auth_token;
      refreshToken = req.cookies.vn_refresh_token;
    }

    // Check headers for tokens
    if (!accessToken) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        accessToken = authHeader.split(" ")[1];
      }
    }

    if (!refreshToken) {
      refreshToken = req.headers.vn_refresh_token as string;
    }

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedError("Authentication required");
    }

    const JWT_ACCESS_SECRET = process.env.JWT_SECRET!;
    if (!JWT_ACCESS_SECRET) {
      console.error("JWT_SECRET is not defined");
      throw new InternalServerError("JWT secret is not configured");
    }

    try {
      let decodedToken: TokenPayload;

      if (!accessToken && refreshToken) {
        // If we only have refresh token, try to get a new access token
        const { newAccessToken, newRefreshToken } = await refreshAccessToken(refreshToken);
        
        // Set the new tokens in cookies
        res.cookie('vn_auth_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
        
        res.cookie('vn_refresh_token', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });

        accessToken = newAccessToken;
      }

      try {
        decodedToken = verify(accessToken!, JWT_ACCESS_SECRET) as TokenPayload;
      } catch (verifyError: unknown) {
        if (
          verifyError instanceof Error &&
          verifyError.name === "TokenExpiredError" &&
          refreshToken
        ) {
          // Token expired, try to refresh
          const { newAccessToken, newRefreshToken } = await refreshAccessToken(refreshToken);
          
          // Set the new tokens in cookies
          res.cookie('vn_auth_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
          
          res.cookie('vn_refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });

          decodedToken = verify(
            newAccessToken,
            JWT_ACCESS_SECRET
          ) as TokenPayload;
        } else {
          throw verifyError;
        }
      }

      req.user = {
        userId: decodedToken.userId,
        email: decodedToken.email,
        role: decodedToken.role,
        reliabilityScore: decodedToken.reliabilityScore,
      };

      next();
    } catch (verifyError: unknown) {
      console.error("Token verification error:", verifyError);
      // Clear cookies on verification failure
      res.clearCookie('vn_auth_token');
      res.clearCookie('vn_refresh_token');
      throw new UnauthorizedError("Invalid or expired token");
    }
  } catch (error) {
    // Clear cookies on any authentication error
    res.clearCookie('vn_auth_token');
    res.clearCookie('vn_refresh_token');
    next(error);
  }
};

async function refreshAccessToken(refreshToken: string): Promise<{ newAccessToken: string, newRefreshToken: string }> {
  try {
    const response = await axios.post(
      `${process.env.AUTH_SERVICE_URL}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.accessToken || !response.data.refreshToken) {
      throw new Error("Invalid response from auth service");
    }

    return {
      newAccessToken: response.data.accessToken,
      newRefreshToken: response.data.refreshToken
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Refresh token error details:", {
        status: error.response?.status,
        message: error.response?.data,
      });
    }
    throw new UnauthorizedError("Failed to refresh token - please login again");
  }
}