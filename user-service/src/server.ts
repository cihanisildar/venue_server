import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { UserRepository } from './modules/users/repositories/user.repository';
import { UserService } from './modules/users/services/user.service';
import { UserController } from './modules/users/controllers/user.controller';
import { setupUserRoutes } from './modules/users/routes/user.routes';
import { config } from './config';

dotenv.config();

const app = express();
const port = config.port;

// Middleware
app.use(helmet());
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

// Initialize dependencies
const prisma = new PrismaClient();
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Setup user routes
app.use('/', setupUserRoutes(userController));

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 User Service running on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});