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
import { swaggerSpec, swaggerUi } from "./api-gateway/config/swagger.config";

dotenv.config();

class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  private initializeSwagger(): void {
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "API Documentation",
        customfavIcon: "/favicon.ico",
      })
    );

    // Endpoint to serve swagger.json
    this.app.get("/swagger.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });
  }

  private initializeMiddlewares(): void {
    // Order of middleware is important!
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
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) return callback(null, true);

          if (allowedOrigins.indexOf(origin) !== -1) {
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
    // Body parsing middleware should come before routes
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true }));

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
    this.app.use("/api/user", userRoutes.router);

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
