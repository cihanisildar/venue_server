import { Request, Response, RequestHandler } from "express";
import { AuthService } from "../services/auth.service";
import {
  RegisterUser,
  LoginUser,
  AuthenticatedRequest,
} from "../interfaces/auth.interface";
import {
  registerUserSchema,
  loginUserSchema,
} from "../interfaces/auth.interface";

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  public register: RequestHandler = async (req: Request, res: Response) => {
    try {

      console.log("Requested body inside the auth-service:", req.body);
      
      const validatedData = registerUserSchema.parse(req.body);
      const result = await this.service.register(
        validatedData,
        res,
        req.headers["user-agent"]
      );

      

      res.status(201).json({
        message: "User registered successfully",
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            username: result.user.username,
          },
          ...result.tokens,
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      res.status(400).json({
        message: errorMessage,
        error: error instanceof Error ? error : String(error),
      });
    }
  };

  public login: RequestHandler = async (req: Request, res: Response) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      const result = await this.service.login(
        validatedData,
        res,
        req.headers["user-agent"]
      );

      res.status(200).json({
        message: "Login successful",
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            username: result.user.username,
          },
          ...result.tokens,
        },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      res.status(401).json({
        message: errorMessage,
        error: error instanceof Error ? error : String(error),
      });
    }
  };

  public checkAuth: RequestHandler = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const accessToken = req.headers["authorization"]?.split(" ")[1]; // Extract access token from Authorization header
      const refreshToken = req.cookies.vn_refresh_token; // Access the refresh token from cookies

      console.log("ACCESS", accessToken);
      console.log("REFRESH", refreshToken);
      
      if (!accessToken && !refreshToken) {
        throw new Error("No tokens provided");
      }

      // Validate the access token if it exists
      if (accessToken) {
        const decodedAccess = await this.service.validateAccessToken(
          accessToken
        );
        res.status(200).json({
          message: "User is authenticated",
          user: {
            id: decodedAccess.userId,
            role: decodedAccess.role,
          },
        });
        return; // Ensure to return after sending the response
      }

      // Validate the refresh token if the access token is not present
      if (refreshToken) {
        const decodedRefresh = await this.service.validateRefreshToken(
          refreshToken
        );
        res.status(200).json({
          message: "User is authenticated via refresh token",
          user: {
            id: decodedRefresh.userId,
            role: decodedRefresh.role,
          },
        });
        return; // Ensure to return after sending the response
      }

      // If neither token is valid, return an error
      throw new Error("Invalid tokens provided");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Authentication check failed";
      res.status(401).json({
        message: errorMessage,
        error: error instanceof Error ? error : String(error),
      });
    }
  };

  public refresh: RequestHandler = async (req: Request, res: Response) => {
    try {
      const refreshToken =
        req.cookies.vn_refresh_token || req.body.refreshToken;
      
      if (!refreshToken) {
        throw new Error("No refresh token provided");
      }

      const result = await this.service.refresh(
        refreshToken,
        res,
        req.headers["user-agent"]
      );

      res.status(200).json({
        message: "Token refreshed successfully",
        data: result.tokens,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Token refresh failed";
      res.status(401).json({
        message: errorMessage,
        error: error instanceof Error ? error : String(error),
      });
    }
  };

  public logout: RequestHandler = async (req: Request, res: Response) => {
    try {
      const refreshToken =
        req.cookies.vn_refresh_token || req.body.refreshToken;

      if (refreshToken) {
        await this.service.logout(refreshToken, res);
      }

      if (req.headers.origin) {
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
      }

      res.status(200).json({
        message: "Logout successful",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Logout failed";
      res.status(400).json({
        message: errorMessage,
        error: error instanceof Error ? error : String(error),
      });
    }
  };

  public updatePassword: RequestHandler = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        throw new Error("Old password and new password are required");
      }

      await this.service.updatePassword(userId, oldPassword, newPassword);

      // Logout user after password change
      await this.service.logout(
        req.cookies.vn_refresh_token || req.body.refreshToken,
        res
      );

      res.status(200).json({
        message: "Password updated successfully. Please login again.",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Password update failed";
      res.status(400).json({
        message: errorMessage,
        error: error instanceof Error ? error : String(error),
      });
    }
  };
}
