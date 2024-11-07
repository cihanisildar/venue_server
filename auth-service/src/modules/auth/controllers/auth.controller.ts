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

  // Cookie configuration object to ensure consistency
  private readonly cookieConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? ("strict" as const)
        : ("lax" as const), // Explicitly type sameSite
    domain: undefined,
    path: "/", // Important: This needs to match the cookie path when it was set
  };

  constructor() {
    this.service = new AuthService();
  }
  private setCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    req: Request
  ) {
    console.log("setCookies called with:", {
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length,
      hasRefreshToken: !!refreshToken,
      refreshTokenLength: refreshToken?.length,
    });

    if (!accessToken || !refreshToken) {
      console.error("Missing tokens when setting cookies");
      throw new Error("Authentication tokens are required");
    }

    // Set cookies with more debug info
    try {
      res.cookie("vn_auth_token", accessToken, {
        ...this.cookieConfig,
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie("vn_refresh_token", refreshToken, {
        ...this.cookieConfig,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Verify cookies were set
      const cookies = res.getHeader("Set-Cookie");
      console.log("Cookies after setting:", {
        cookieHeader: cookies,
        cookieCount: Array.isArray(cookies) ? cookies.length : 0,
      });

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Error setting cookies:", error);
      throw error;
    }
  }

  private clearCookies(res: Response) {
    // Use the same config to clear cookies effectively
    res.cookie("vn_auth_token", "", {
      ...this.cookieConfig,
      maxAge: 0, // Set maxAge to 0 to clear the cookie
      expires: new Date(0), // Ensures compatibility with all browsers
    });

    res.cookie("vn_refresh_token", "", {
      ...this.cookieConfig,
      maxAge: 0, // Set maxAge to 0 to clear the cookie
      expires: new Date(0), // Ensures compatibility with all browsers
    });
  }

  private isWebRequest(req: Request): boolean {
    return (
      req.headers["user-agent"]?.toLowerCase().includes("mozilla") || false
    );
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
      console.log("Starting login process for:", validatedData.email);

      const result = await this.service.login(validatedData);

      console.log("Login result before setCookies:", {
        hasAccessToken: !!result.accessToken,
        accessTokenLength: result.accessToken?.length,
        hasRefreshToken: !!result.refreshToken,
        refreshTokenLength: result.refreshToken?.length,
      });

      const tokens = this.setCookies(
        res,
        result.accessToken,
        result.refreshToken,
        req
      );

      // Check response headers after setting cookies
      const cookies = res.getHeader("Set-Cookie");
      console.log("Response headers after setCookies:", {
        cookies: cookies,
        hasSetCookieHeader: !!cookies,
      });

      const responseData = {
        message: "Login successful",
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            username: result.user.username,
          },
          ...(this.isWebRequest(req) ? {} : tokens),
        },
      };

      console.log("Sending response:", {
        hasUserData: !!responseData.data.user,
        hasTokens: !this.isWebRequest(req) && !!tokens,
      });

      res.status(200).json(responseData);
    } catch (error: unknown) {
      console.error("Login error:", error);
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
      console.log("Cookies received:", req.cookies);
      console.log("Headers received:", req.headers);

      const refreshToken =
        req.cookies.vn_refresh_token || req.body.refreshToken;
      console.log("Refresh token being used:", refreshToken);

      if (!refreshToken) {
        throw new Error("No refresh token provided");
      }

      const tokens = await this.service.refreshTokens(refreshToken);
      console.log("New tokens generated:", tokens);

      const newTokens = this.setCookies(
        res,
        tokens.accessToken,
        tokens.refreshToken,
        req
      );

      console.log("Response being sent:", {
        message: "Tokens refreshed successfully",
        data: this.isWebRequest(req) ? {} : newTokens,
      });

      res.status(200).json({
        message: "Tokens refreshed successfully",
        data: this.isWebRequest(req) ? {} : newTokens,
      });
    } catch (error: unknown) {
      console.error("Refresh error:", error);
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

      // Set appropriate CORS headers if needed
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
