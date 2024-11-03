import { Request, Response, RequestHandler } from "express";
import { AuthService } from "../services/auth.service";
import { RegisterUser, LoginUser, AuthenticatedRequest } from "../interfaces/auth.interface";
import { registerUserSchema, loginUserSchema } from "../interfaces/auth.interface";

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  private setCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    req: Request
  ) {
    if (this.isWebRequest(req)) {
      res.cookie("vn_auth_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("vn_refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    return { accessToken, refreshToken };
  }

  private clearCookies(res: Response) {
    res.clearCookie("vn_auth_token");
    res.clearCookie("vn_refresh_token");
  }

  private isWebRequest(req: Request): boolean {
    return req.headers["user-agent"]?.toLowerCase().includes("mozilla") || false;
  }

  public register: RequestHandler = async (req: Request, res: Response) => {
    console.log("register", req.body);
    
    try {
      const validatedData = registerUserSchema.parse(req.body);
      const result = await this.service.register(validatedData);

      const tokens = this.setCookies(
        res,
        result.accessToken,
        result.refreshToken,
        req
      );

      res.status(201).json({
        message: "User registered successfully",
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            username: result.user.username,
          },
          ...(this.isWebRequest(req) ? {} : tokens),
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
      const result = await this.service.login(validatedData);

      const tokens = this.setCookies(
        res,
        result.accessToken,
        result.refreshToken,
        req
      );

      res.status(200).json({
        message: "Login successful",
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            username: result.user.username,
          },
          ...(this.isWebRequest(req) ? {} : tokens),
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

  public refresh: RequestHandler = async (req: Request, res: Response) => {
    try {
      const refreshToken =
        req.cookies.vn_refresh_token || req.body.refreshToken;

      if (!refreshToken) {
        throw new Error("No refresh token provided");
      }

      const tokens = await this.service.refreshTokens(refreshToken);
      const newTokens = this.setCookies(
        res,
        tokens.accessToken,
        tokens.refreshToken,
        req
      );

      res.status(200).json({
        message: "Tokens refreshed successfully",
        data: this.isWebRequest(req) ? {} : newTokens,
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
        await this.service.logout(refreshToken);
      }

      this.clearCookies(res);

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

  public updatePassword: RequestHandler = async (req: AuthenticatedRequest, res: Response) => {
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
      this.clearCookies(res);

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