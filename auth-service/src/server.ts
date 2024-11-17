import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import { AuthController } from "./modules/auth/controllers/auth.controller";
import { setupAuthRoutes } from "./modules/auth/routes/auth.routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

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
      "Cookie",
    ],
    exposedHeaders: ["Set-Cookie"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Set up auth routes
const authController = new AuthController();
app.use("/", setupAuthRoutes(authController));

app.listen(port, () => {
  console.log(`🚀 Auth Service running on port ${port}`);
});
