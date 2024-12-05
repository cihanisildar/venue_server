import express, { ErrorRequestHandler, Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { errorHandler } from "./api-gateway/middleware/error.middleware";
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
    this.app.use(helmet());
    this.app.use(cookieParser());

    const allowedOrigins = [
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
    ].filter(Boolean);

    this.app.use(
      cors({
        origin: function (origin, callback) {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            console.log("Origin blocked:", origin);
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "Cookie",
          "X-Gateway-Secret",
        ],
        exposedHeaders: ["Set-Cookie"],
      })
    );

    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));

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
    console.log("Initializing routes...");

    const authRoutes = new AuthRoutes();
    const userRoutes = new UserRoutes();

    // Use JWT verification middleware for secured routes
    this.app.use("/api/user", userRoutes.router);

    this.app.use("/api/auth", authRoutes.router);

    // Test endpoint
    this.app.get("/test", (req, res) => {
      console.log("Auth token from cookies:", req.cookies.vn_auth_token);
      console.log("Refresh token from cookies:", req.cookies.vn_refresh_token);
    });

    this.app.use((req, res, next) => {
      console.log("Auth token from cookies:", req.cookies.vn_auth_token);
      console.log("Refresh token from cookies:", req.cookies.vn_refresh_token);
      next();
    });

    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path} - Route not found`);
      res.status(404).json({
        message: "Route not found",
        path: req.path,
      });
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
