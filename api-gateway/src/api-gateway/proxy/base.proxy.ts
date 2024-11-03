// src/api-gateway/proxy/base.proxy.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { Request } from 'express';
import { ServiceRegistry } from '../config/service.registry';
import { throwError } from '../../common/utils/error.utils';

export class BaseServiceProxy {
  protected client: AxiosInstance;
  protected serviceRegistry: ServiceRegistry;
  protected circuitBreaker: any; // Use proper circuit breaker type

  constructor(serviceName: string) {
    this.serviceRegistry = ServiceRegistry.getInstance();
    const serviceUrl = this.serviceRegistry.getServiceUrl(serviceName);
    
    this.client = axios.create({
      baseURL: serviceUrl,
      timeout: 5000,
    });

    this.setupRequestInterceptors();
    this.setupResponseInterceptors();
  }

  private setupRequestInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        // Add request logging
        this.logRequest(config);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  private setupResponseInterceptors(): void {
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          // Handle specific error responses
          switch (error.response.status) {
            case 404:
              throw throwError.notFound('Resource not found');
            case 401:
              throw throwError.unauthorized('Unauthorized access');
            case 403:
              throw throwError.forbidden('Forbidden access');
            default:
              throw throwError.internal('Service unavailable');
          }
        }
        throw error;
      }
    );
  }

  protected async forward(req: Request, config: AxiosRequestConfig = {}) {
    const defaultConfig: AxiosRequestConfig = {
      method: req.method,
      url: req.path,
      data: req.body,
      headers: {
        ...this.getForwardHeaders(req),
      },
      params: req.query,
    };

    return this.client.request({ ...defaultConfig, ...config });
  }

  private getForwardHeaders(req: Request): Record<string, string> {
    const forwardHeaders: Record<string, string> = {};
    const headersToForward = [
      'authorization',
      'content-type',
      'user-agent',
      'x-request-id',
    ];

    headersToForward.forEach((header) => {
      const value = req.headers[header];
      if (value) {
        forwardHeaders[header] = Array.isArray(value) ? value[0] : value;
      }
    });

    // Add correlation ID for request tracing
    forwardHeaders['x-correlation-id'] = req.headers['x-correlation-id'] as string 
      || generateCorrelationId();

    return forwardHeaders;
  }

  protected logRequest(config: AxiosRequestConfig): void {
    console.log(`[${new Date().toISOString()}] ${config.method?.toUpperCase()} ${config.url}`);
  }
}

function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}