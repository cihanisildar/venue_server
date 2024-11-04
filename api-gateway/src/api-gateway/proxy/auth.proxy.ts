import { Request, Response, NextFunction } from "express";
import axios, { AxiosInstance } from "axios";
import { ServiceRegistry } from "../config/service.registry";
import { AuthenticatedRequest } from "../interfaces/auth.interface";
export class AuthServiceProxy {
  private readonly axiosInstance: AxiosInstance;
  private readonly serviceUrl: string;

  constructor() {
    this.serviceUrl = ServiceRegistry.getInstance().getServiceUrl("auth");
    this.axiosInstance = axios.create({
      baseURL: this.serviceUrl,
      withCredentials: true,
      maxRedirects: 5,
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async handleLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      console.log('API Gateway: Processing login request');
      
      const response = await this.axiosInstance.post("/login", req.body, {
        headers: this.getRequestHeaders(req),
      });
      
      console.log('API Gateway: Auth service response received:', {
        status: response.status,
        hasCookies: !!response.headers['set-cookie'],
        cookieCount: response.headers['set-cookie']?.length,
        cookies: response.headers['set-cookie']?.map(c => c.split(';')[0].split('=')[0])
      });

      // Forward cookies
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        console.log('API Gateway: Forwarding cookies to client');
        res.setHeader('Set-Cookie', cookies);
      } else {
        console.log('API Gateway: No cookies to forward');
      }

      // Verify response data
      console.log('API Gateway: Response data:', {
        hasMessage: !!response.data.message,
        hasUser: !!response.data.data?.user,
        hasTokens: !!response.data.data?.accessToken
      });

      res.status(200).json(response.data);
    } catch (error) {
      console.error('API Gateway: Login error:', error);
      this.handleProxyError(error, res);
    }
}

  async handleRegister(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    console.log("Handling registration in AuthServiceProxy:", req.body);

    try {
      const response = await this.axiosInstance.post("/register", req.body, {
        headers: this.getRequestHeaders(req),
      });
      res.status(201).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  async handleRefresh(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await this.axiosInstance.post(
        "/refresh",
        {
          refreshToken: req.cookies.vn_refresh_token || req.body.refreshToken,
        },
        {
          headers: this.getRequestHeaders(req),
        }
      );
      res.status(200).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  async handleLogout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await this.axiosInstance.post(
        "/logout",
        {},
        {
          headers: {
            ...this.getRequestHeaders(req),
            Cookie: req.headers.cookie || "",
          },
          withCredentials: true,
          maxRedirects: 0,
          validateStatus: null,
        }
      );

      // Forward all headers from auth service response
      Object.entries(response.headers).forEach(([key, value]) => {
        // Forward Set-Cookie headers
        if (key.toLowerCase() === "set-cookie") {
          res.setHeader(key, value);
        }
      });

      // Forward status code and response body
      res.status(response.status).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  async handleUpdatePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await this.axiosInstance.put("/password", req.body, {
        headers: this.getRequestHeaders(req),
      });
      res.status(200).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  private getRequestHeaders(req: Request) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Forward important headers
    ['authorization', 'user-agent', 'origin'].forEach(header => {
      if (req.headers[header]) {
        headers[header] = req.headers[header] as string;
      }
    });

    console.log('API Gateway: Request headers:', headers);
    return headers;
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
      res.status(503).json({ message: "Auth service unavailable" });
    } else {
      res.status(500).json({ message: "Internal gateway error" });
    }
  }
}
