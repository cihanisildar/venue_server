import { compare } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { AuthRepository } from "../repositories/auth.repository";
import {
  RegisterUser,
  LoginUser,
  TokenPayload,
} from "../interfaces/auth.interface";
import axios, { AxiosError } from "axios";
import { Response } from "express";
import { UserService } from "./user.service";

const CONFIG = {
  services: {
    internalAuthToken: process.env.INTERNAL_AUTH_TOKEN,
  },
};

export class AuthService {
  private repository: AuthRepository;
  private userService = new UserService();
  private readonly JWT_ACCESS_SECRET = process.env.JWT_SECRET;
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  private readonly ACCESS_TOKEN_EXPIRY = "15m";
  private readonly REFRESH_TOKEN_EXPIRY = "7d";

  // Cookie configuration object
  private readonly cookieConfig: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax" | "strict" | "none" | undefined;
    domain: string | undefined;
    path: string;
  } = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    domain: undefined,
    path: "/",
  };

  constructor() {
    // Validate JWT secrets are properly configured
    if (!this.JWT_ACCESS_SECRET || !this.JWT_REFRESH_SECRET) {
      throw new Error("JWT secrets not properly configured");
    }
    this.repository = new AuthRepository();
  }

  async register(userData: RegisterUser, res: Response, userAgent?: string) {
    const existingUser = await this.repository.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const existingUsername = await this.repository.findUserByUsername(
      userData.username
    );
    if (existingUsername) {
      throw new Error("Username already taken");
    }

    try {
      const authUser = await this.repository.createUserForUserService(userData);
      console.log("The one will send the user-service:", authUser);

      const { accessToken, refreshToken } = await this.generateTokens(authUser);
      await this.userService.createUserProfile(authUser, accessToken);
      await this.repository.updateLastLogin(authUser.id);

      // Set cookies
      this.setCookies(res, accessToken, refreshToken);

      return {
        user: authUser,
        tokens: this.isWebRequest(userAgent)
          ? undefined
          : { accessToken, refreshToken },
      };
    } catch (error) {
      throw error;
    }
  }

  async login(loginData: LoginUser, res: Response, userAgent?: string) {
    const user = await this.repository.findUserByEmail(loginData.email);
    if (!user || !user.account) {
      throw new Error("Invalid credentials");
    }

    if (user.restrictedUntil && user.restrictedUntil > new Date()) {
      throw new Error("Account is temporarily restricted");
    }

    const isPasswordValid = await compare(
      loginData.password,
      user.account.hashedPassword
    );
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    await this.repository.deleteAllUserRefreshTokens(user.id);
    await this.repository.updateLastLogin(user.id);

    try {
      const { accessToken, refreshToken } = await this.generateTokens(user);

      // Set cookies
      this.setCookies(res, accessToken, refreshToken);

      return {
        user,
        tokens: this.isWebRequest(userAgent)
          ? undefined
          : { accessToken, refreshToken },
      };
    } catch (error) {
      throw new Error("Authentication failed");
    }
  }

  async refresh(refreshToken: string, res: Response, userAgent?: string) {
    try {
      const decoded = verify(
        refreshToken,
        this.JWT_REFRESH_SECRET!
      ) as TokenPayload;
      const storedToken = await this.repository.findRefreshToken(refreshToken);

      if (!storedToken || !storedToken.user) {
        throw new Error("Invalid refresh token");
      }

      if (
        storedToken.user.restrictedUntil &&
        storedToken.user.restrictedUntil > new Date()
      ) {
        throw new Error("Account is temporarily restricted");
      }

      // Generate only access token for refresh requests
      const accessToken = sign(
        {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        },
        this.JWT_ACCESS_SECRET!,
        { expiresIn: this.ACCESS_TOKEN_EXPIRY }
      );

      // Set only access token cookie
      this.setCookies(res, accessToken);

      return {
        tokens: this.isWebRequest(userAgent) ? undefined : { accessToken },
      };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  async logout(refreshToken: string, res: Response) {
    try {
      await this.repository.deleteRefreshToken(refreshToken);
      this.clearCookies(res);
    } catch (error) {
      // Ignore errors during logout
    }
  }

  private setCookies(
    res: Response,
    accessToken: string,
    refreshToken?: string
  ) {
    if (!accessToken) {
      throw new Error("Access token is required");
    }

    // Set access token cookie
    res.cookie("vn_auth_token", accessToken, {
      ...this.cookieConfig,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set refresh token cookie only if provided
    if (refreshToken) {
      res.cookie("vn_refresh_token", refreshToken, {
        ...this.cookieConfig,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    console.log("Set-Cookie headers:", res.getHeaders()["set-cookie"]);

  }

  private clearCookies(res: Response) {
    res.cookie("vn_auth_token", "", {
      ...this.cookieConfig,
      maxAge: 0,
      expires: new Date(0),
    });

    res.cookie("vn_refresh_token", "", {
      ...this.cookieConfig,
      maxAge: 0,
      expires: new Date(0),
    });
  }

  private isWebRequest(userAgent?: string): boolean {
    return userAgent?.toLowerCase().includes("mozilla") || false;
  }

  private async generateTokens(user: any) {
    // Debug initial user data
    console.log("Generating tokens for user:", {
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
    });

    if (!user || !user.id || !user.email) {
      throw new Error("Invalid user data for token generation");
    }

    // Debug environment variables
    console.log("JWT Secrets check:", {
      hasAccessSecret: !!this.JWT_ACCESS_SECRET,
      accessSecretLength: this.JWT_ACCESS_SECRET?.length,
      hasRefreshSecret: !!this.JWT_REFRESH_SECRET,
      refreshSecretLength: this.JWT_REFRESH_SECRET?.length,
      accessExpiry: this.ACCESS_TOKEN_EXPIRY,
      refreshExpiry: this.REFRESH_TOKEN_EXPIRY,
    });

    const tokenPayload = {
      userId: user.id,
    };

    try {
      // Debug payload
      console.log("Token payload:", tokenPayload);

      const accessToken = sign(tokenPayload, this.JWT_ACCESS_SECRET!, {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
      });

      const refreshToken = sign(tokenPayload, this.JWT_REFRESH_SECRET!, {
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
      });

      // Debug generated tokens
      console.log("Generated tokens:", {
        accessToken: accessToken
          ? `${accessToken.substring(0, 10)}...`
          : "missing",
        accessTokenLength: accessToken?.length,
        refreshToken: refreshToken
          ? `${refreshToken.substring(0, 10)}...`
          : "missing",
        refreshTokenLength: refreshToken?.length,
      });

      // Verify tokens were generated successfully
      if (!accessToken || !refreshToken) {
        throw new Error("Failed to generate tokens");
      }

      // Save refresh token
      await this.repository.saveRefreshToken(user.id, refreshToken);

      // Debug final return value
      console.log("Returning tokens:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
      });

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Token generation error:", error);
      throw new Error("Failed to generate authentication tokens");
    }
  }

  async validateAccessToken(token: string): Promise<TokenPayload> {
    if (!token) {
      throw new Error("No token provided");
    }

    try {
      const decoded = verify(token, this.JWT_ACCESS_SECRET!) as TokenPayload;
      const user = await this.repository.findById(decoded.userId);

      if (!user) {
        throw new Error("User not found");
      }

      if (user.restrictedUntil && user.restrictedUntil > new Date()) {
        throw new Error("Account is temporarily restricted");
      }

      return decoded;
    } catch (error) {
      console.error("Token validation error:", error);
      throw new Error("Invalid access token");
    }
  }

  async validateRefreshToken(token: string): Promise<TokenPayload> {
    if (!token) {
      throw new Error("No refresh token provided");
    }

    try {
      const decoded = verify(token, this.JWT_REFRESH_SECRET!) as TokenPayload;
      const user = await this.repository.findById(decoded.userId);

      if (!user) {
        throw new Error("User not found");
      }

      if (user.restrictedUntil && user.restrictedUntil > new Date()) {
        throw new Error("Account is temporarily restricted");
      }

      return decoded; // Return the decoded payload if valid
    } catch (error) {
      console.error("Refresh token validation error:", error);
      throw new Error("Invalid refresh token");
    }
  }

  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await this.repository.findById(userId);
    if (!user || !user.account) {
      throw new Error("User not found");
    }

    const isPasswordValid = await compare(
      oldPassword,
      user.account.hashedPassword
    );
    if (!isPasswordValid) {
      throw new Error("Invalid current password");
    }

    await this.repository.updatePassword(userId, newPassword);
    await this.repository.deleteAllUserRefreshTokens(userId);

    return { message: "Password updated successfully" };
  }
}
