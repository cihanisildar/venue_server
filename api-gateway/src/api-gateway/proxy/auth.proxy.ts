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

  async handleRefresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get refresh token, prioritizing header over cookie
      const headerToken = req.headers.vn_refresh_token as string | undefined;
      const cookieToken = req.cookies?.vn_refresh_token;
      const refreshToken = headerToken || cookieToken;

      console.log('Token selection:', {
        headerToken: headerToken?.substring(0, 20) + '...',
        cookieToken: cookieToken?.substring(0, 20) + '...',
        selected: refreshToken?.substring(0, 20) + '...'
      });

      if (!refreshToken) {
        res.status(401).json({ message: 'No refresh token provided' });
        return;
      }

      // Make request to auth service
      const response = await this.axiosInstance.post(
        "/refresh",
        { refreshToken }, // Send in body
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Refresh-Token': refreshToken // Send as custom header
          }
        }
      );

      // Forward any Set-Cookie headers
      if (response.headers['set-cookie']) {
        response.headers['set-cookie'].forEach(cookie => {
          res.setHeader('Set-Cookie', cookie);
        });
      }

      console.log('Auth service response:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });

      res.status(200).json(response.data);
    } catch (error: any) {
      console.error('Refresh token error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        stack: error.stack
      });
      
      if (error.response?.status === 401) {
        res.status(401).json(error.response.data || { message: 'Invalid refresh token' });
      } else {
        res.status(500).json({ 
          message: 'Internal server error during token refresh',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
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

    // Forward cookie header if present
    if (req.headers.cookie) {
      headers['Cookie'] = req.headers.cookie;
    }

    // Forward refresh token from header if present
    const headerToken = req.headers.vn_refresh_token;
    if (headerToken && typeof headerToken === 'string') {
      headers['vn_refresh_token'] = headerToken;
    }

    console.log('Forwarding headers to auth service:', headers);
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
