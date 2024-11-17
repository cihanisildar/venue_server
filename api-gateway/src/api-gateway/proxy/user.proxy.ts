import { Request, Response, NextFunction } from "express";
import axios, { AxiosInstance } from "axios";
import { ServiceRegistry } from "../config/service.registry";
import { AuthenticatedRequest } from "../interfaces/auth.interface";
import {
  CreateUserDTO,
  UpdateUserPreferenceDTO,
  UpdateUserProfileDTO,
} from "../interfaces/user.interface";
import { UnauthorizedError } from "../../common/errors/custom.error";

export class UserServiceProxy {
  private readonly axiosInstance: AxiosInstance;
  private readonly serviceUrl: string;

  constructor() {
    this.serviceUrl = ServiceRegistry.getInstance().getServiceUrl("user");
    this.axiosInstance = axios.create({
      baseURL: this.serviceUrl,
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async handleCreateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userData: CreateUserDTO = req.body;
      const response = await this.axiosInstance.post("/profile", userData, {
        headers: this.getRequestHeaders(req),
      });
      res.status(201).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  async handleGetProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await this.axiosInstance.get(`/profile`, {
        headers: this.getRequestHeaders(req),
      });
      res.status(200).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  async handleUpdateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user || !req.user.userId) {
        throw new UnauthorizedError("User not authenticated");
      }

      const userId = req.user.userId;
      console.log("Updating profile for user:", userId);

      const profileData: UpdateUserProfileDTO = req.body;
      const response = await this.axiosInstance.put(`/profile`, profileData, {
        headers: this.getRequestHeaders(req),
      });
      res.status(200).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  // async handleCreateUserProfile(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     const profileData = req.body; // Assuming the profile data is sent in the request body
  //     const response = await this.axiosInstance.post(
  //       "/profile",
  //       profileData,
  //       {
  //         headers: this.getRequestHeaders(req),
  //       }
  //     );
  //     res.status(201).json(response.data);
  //   } catch (error) {
  //     this.handleProxyError(error, res);
  //   }
  // }

  async handleUpdatePreferences(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const preferences: UpdateUserPreferenceDTO = req.body;
      const response = await this.axiosInstance.put(
        `/preferences`,
        preferences,
        {
          headers: this.getRequestHeaders(req),
        }
      );
      res.status(200).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  async handleGetReliabilityScore(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await this.axiosInstance.get(`/reliability-score`, {
        headers: this.getRequestHeaders(req),
      });
      res.status(200).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  private getRequestHeaders(req: Request) {
    let authHeader = req.headers.authorization;

    // If no Authorization header but token exists in cookies, use it
    if (!authHeader && req.cookies?.vn_auth_token) {
      authHeader = `Bearer ${req.cookies.vn_auth_token}`;
    }

    return {
      Authorization: authHeader,
      "x-correlation-id":
        req.headers["x-correlation-id"] || this.generateCorrelationId(),
      "X-Gateway-Secret": process.env.API_GATEWAY_SECRET,
      // Forward cookies if they exist
      Cookie: req.headers.cookie,
    };
  }

  private generateCorrelationId(): string {
    return `correlation-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  private handleProxyError(error: any, res: Response): void {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      res.status(503).json({ message: "User service unavailable" });
    } else {
      res.status(500).json({ message: "Internal gateway error" });
    }
  }
}
