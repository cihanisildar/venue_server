import { Request, Response, NextFunction } from 'express';
import axios, { AxiosInstance } from 'axios';
import { ServiceRegistry } from '../config/service.registry';
import { AuthenticatedRequest } from '../interfaces/auth.interface'; 
import { CreateUserDTO, UpdateUserPreferenceDTO } from '../interfaces/user.interface';

export class UserServiceProxy {
  private readonly axiosInstance: AxiosInstance;
  private readonly serviceUrl: string;

  constructor() {
    this.serviceUrl = ServiceRegistry.getInstance().getServiceUrl('user');
    this.axiosInstance = axios.create({
      baseURL: this.serviceUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async handleCreateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: CreateUserDTO = req.body;
      const response = await this.axiosInstance.post('/users', userData, {
        headers: this.getRequestHeaders(req)
      });
      res.status(201).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  async handleGetProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.axiosInstance.get(`/users/profile`, {
        headers: this.getRequestHeaders(req)
      });
      res.status(200).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  async handleUpdatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const preferences: UpdateUserPreferenceDTO = req.body;
      const response = await this.axiosInstance.put(
        `/users/preferences`,
        preferences,
        {
          headers: this.getRequestHeaders(req)
        }
      );
      res.status(200).json(response.data);
    } catch (error) {
      this.handleProxyError(error, res);
    }
  }

  async handleGetReliabilityScore(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const response = await this.axiosInstance.get(`/users/reliability-score`, {
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
      'x-user-id': (req as AuthenticatedRequest).user?.userId || req.headers['x-user-id'] // For testing purposes
    };
  }

  private generateCorrelationId(): string {
    return `correlation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleProxyError(error: any, res: Response): void {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      res.status(503).json({ message: 'User service unavailable' });
    } else {
      res.status(500).json({ message: 'Internal gateway error' });
    }
  }
}