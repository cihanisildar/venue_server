import express, { ErrorRequestHandler, Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { errorHandler } from "./api-gateway/middleware/error.middleware";
// import { configureRoutes } from './api-gateway/config/routes.config';
import { rateLimiter } from "./api-gateway/middleware/rate-limit.middleware";
import { AuthRoutes } from "./api-gateway/routes/auth.routes";
import { UserRoutes } from "./api-gateway/routes/user.routes";

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
    // Order of middleware is important!
    this.app.use(helmet());

    this.app.use(
      cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
        exposedHeaders: ["Set-Cookie"],
      })
    );

    // Body parsing middleware should come before routes
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());

    // Add logging middleware
    this.app.use((req, res, next) => {
      console.log("Incoming request:", {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers,
      });
      next();
    });

    this.app.use(rateLimiter);
  }

  private initializeRoutes(): void {
    // Add debug logging
    console.log("Initializing routes...");

    const authRoutes = new AuthRoutes();
    const userRoutes = new UserRoutes();

    this.app.use("/api/auth", authRoutes.router);
    this.app.use("/api/users", userRoutes.router);

    // Debug route to verify Express is working
    this.app.get("/health", (req, res) => {
      res.json({ status: "ok" });
    });

    // Test endpoint
    this.app.get("/test", (req, res) => {
      res.json({ message: "Test endpoint working" });
    });

    // Debug logging for all requests
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path} - Route not found`);
      next();
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler as ErrorRequestHandler);
  }

  public async start(): Promise<void> {
    try {
      const port = process.env.PORT || 8000;
      this.app.listen(port, () => {
        console.log(`🚀 API Gateway is running on port ${port}`);
        console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
        console.log(`🔥 Environment: ${process.env.NODE_ENV}`);
      });
    } catch (error) {
      console.error("Failed to start API Gateway:", error);
      process.exit(1);
    }
  }
}
const app = new App();
app.start().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});

export default app;
