import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { UserRepository } from "./modules/users/repositories/user.repository";
import { UserService } from "./modules/users/services/user.service";
import { UserController } from "./modules/users/controllers/user.controller";
import { setupUserRoutes } from "./modules/users/routes/user.routes";
import { config } from "./config";

dotenv.config();

const app = express();
const port = config.port;

// Middleware
app.use(helmet());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Frontend
      "http://localhost:8000", // API Gateway
      process.env.CORS_ORIGIN,
    ].filter(Boolean) as string[],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-correlation-id",
      "x-user-id",
    ],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize dependencies
const prisma = new PrismaClient();
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Basic health check endpoint
app.set("trust proxy", true);

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});
app.use((req, res, next) => {
  console.log("Incoming request:", {
      method: req.method,
      path: req.path,
      body: req.body,
      headers: req.headers,
  });
  next();
});

// Setup user routes
app.use("/", setupUserRoutes(userController));

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
  }
);

// Start server
app.listen(port, () => {
  console.log(`🚀 User Service running on port ${port}`);
});

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await prisma.$disconnect();
  process.exit(0);
});
