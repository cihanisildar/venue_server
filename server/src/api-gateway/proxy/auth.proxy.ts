import { Request, Response, NextFunction } from 'express';
import axios, { AxiosInstance } from 'axios';
import { ServiceRegistry } from '../config/service.registry';
import { AuthenticatedRequest } from '../interfaces/auth.interface';
export class AuthServiceProxy {
  private readonly axiosInstance: AxiosInstance;
  private readonly serviceUrl: string;

  constructor() {
    this.serviceUrl = ServiceRegistry.getInstance().getServiceUrl('auth');
    this.axiosInstance = axios.create({
      baseURL: this.serviceUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async handleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.axiosInstance.post('/auth/login', req.body, {
        headers: this.getRequestHeaders(req)
      });
      res.status(200).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  async handleRegister(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.axiosInstance.post('/auth/register', req.body, {
        headers: this.getRequestHeaders(req)
      });
      res.status(201).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  async handleRefresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.axiosInstance.post('/auth/refresh', {
        refreshToken: req.cookies.vn_refresh_token || req.body.refreshToken
      }, {
        headers: this.getRequestHeaders(req)
      });
      res.status(200).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  async handleLogout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.axiosInstance.post('/auth/logout', {
        refreshToken: req.cookies.vn_refresh_token || req.body.refreshToken
      }, {
        headers: this.getRequestHeaders(req)
      });
      res.status(200).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  async handleUpdatePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.axiosInstance.put('/auth/password', req.body, {
        headers: this.getRequestHeaders(req)
      });
      res.status(200).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  private getRequestHeaders(req: Request) {
    return {
      'Authorization': req.headers.authorization,
      'x-correlation-id': req.headers['x-correlation-id'] || this.generateCorrelationId(),
      'x-user-id': (req as AuthenticatedRequest).user?.userId
    };
  }

  private generateCorrelationId(): string {
    return `correlation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleProxyError(error: any, res: Response): void {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      res.status(503).json({ message: 'Auth service unavailable' });
    } else {
      res.status(500).json({ message: 'Internal gateway error' });
    }
  }
}