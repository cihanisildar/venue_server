import { RequestHandler, Router } from "express";
import { AuthServiceProxy } from "../proxy/auth.proxy";
import { validateRequest } from "../middleware/validate-request.middleware";
import { authenticate } from "../middleware/authenticate.middleware";
import { z } from "zod";
import { loginUserSchema } from "../interfaces/auth.interface";

// Register schema definition
const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3),
  name: z.string(),
  age: z.number().optional(),
  phoneNumber: z.string().optional(),
});

export class AuthRoutes {
  public router: Router;
  private authProxy: AuthServiceProxy;

  constructor() {
    this.router = Router();
    this.authProxy = new AuthServiceProxy();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * tags:
     *   name: Authentication
     *   description: User authentication endpoints
     */

    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *               - username
     *               - name
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *                 minLength: 6
     *               username:
     *                 type: string
     *                 minLength: 3
     *               name:
     *                 type: string
     *               age:
     *                 type: number
     *               phoneNumber:
     *                 type: string
     *     responses:
     *       201:
     *         description: User successfully registered
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 userId:
     *                   type: string
     *                 message:
     *                   type: string
     *       400:
     *         description: Invalid input data
     *       409:
     *         description: User already exists
     */
    this.router.post(
      "/register",
      validateRequest(registerUserSchema) as RequestHandler,
      (req, res, next) => this.authProxy.handleRegister(req, res, next)
    );

    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Login user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *                 refreshToken:
     *                   type: string
     *       401:
     *         description: Invalid credentials
     */
    this.router.post(
      "/login",
      validateRequest(loginUserSchema) as RequestHandler,
      (req, res, next) => this.authProxy.handleLogin(req, res, next)
    );

    /**
     * @swagger
     * /api/auth/refresh:
     *   post:
     *     summary: Refresh access token
     *     tags: [Authentication]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: New access token generated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 token:
     *                   type: string
     *       401:
     *         description: Invalid refresh token
     */
    this.router.post("/refresh", (req, res, next) =>
      this.authProxy.handleRefresh(req, res, next)
    );

    /**
     * @swagger
     * /api/auth/logout:
     *   post:
     *     summary: Logout user
     *     tags: [Authentication]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Successfully logged out
     *       401:
     *         description: Unauthorized
     */
    this.router.post("/logout", authenticate, (req, res, next) =>
      this.authProxy.handleLogout(req, res, next)
    );

    /**
     * @swagger
     * /api/auth/update-password:
     *   post:
     *     summary: Update user password
     *     tags: [Authentication]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - currentPassword
     *               - newPassword
     *             properties:
     *               currentPassword:
     *                 type: string
     *               newPassword:
     *                 type: string
     *                 minLength: 6
     *     responses:
     *       200:
     *         description: Password successfully updated
     *       400:
     *         description: Invalid password format
     *       401:
     *         description: Current password is incorrect
     */
    this.router.post(
      "/update-password",
      authenticate,
      (req, res, next) => this.authProxy.handleUpdatePassword(req, res, next)
    );

    /**
     * @swagger
     * /api/auth/check:
     *   get:
     *     summary: Check authentication status
     *     tags: [Authentication]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: User is authenticated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 authenticated:
     *                   type: boolean
     *                 user:
     *                   type: object
     *                   properties:
     *                     userId:
     *                       type: string
     *       401:
     *         description: Not authenticated
     */
    this.router.get("/check", authenticate, (req, res, next) =>
      this.authProxy.checkAuth(req, res, next)
    );
  }
}