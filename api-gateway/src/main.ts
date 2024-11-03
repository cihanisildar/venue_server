import express, { ErrorRequestHandler, Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { errorHandler } from './api-gateway/middleware/error.middleware';
import { rateLimiter } from './api-gateway/middleware/rate-limit.middleware';
import { configureRoutes } from './api-gateway/config/routes.config';

dotenv.config();

class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    this.app.use(rateLimiter);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(): void {
    configureRoutes(this.app);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler as ErrorRequestHandler);
  }

  public async start(): Promise<void> {
    try {
      const port = process.env.PORT || 3000;
      this.app.listen(port, () => {
        console.log(`🚀 API Gateway is running on port ${port}`);
        console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
        console.log(`🔥 Environment: ${process.env.NODE_ENV}`);
      });
    } catch (error) {
      console.error('Failed to start API Gateway:', error);
      process.exit(1);
    }
  }
}

const gateway = new App();
gateway.start().catch((error) => {
  console.error('Failed to start API Gateway:', error);
  process.exit(1);
});

export default gateway;