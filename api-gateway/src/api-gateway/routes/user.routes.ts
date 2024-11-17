import { Router } from "express";
import { authenticate } from "../middleware/authenticate.middleware";
import { UserServiceProxy } from "../proxy/user.proxy";
import { validateRequest } from "../middleware/validate-request.middleware";
import { z } from "zod";
import { NoisePreference, TimePreference } from "@prisma/client";

// Validation schemas
const updatePreferencesSchema = z.object({
  budget: z.number().min(0),
  petsAllowed: z.boolean().optional(),
  quiet: z.boolean().optional(),
  outdoor: z.boolean().optional(),
  wifi: z.boolean().optional(),
  parking: z.boolean().optional(),
  accessibility: z.boolean().optional(),
  studyPlace: z.boolean().optional(),
  noiseLevel: z.nativeEnum(NoisePreference).optional(),
  preferredTime: z.nativeEnum(TimePreference).optional(),
  groupSize: z.number().min(1)
});

const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  age: z.number().optional(),
  name: z.string().optional(),
  phoneNumber: z.string().optional()
});

export class UserRoutes {
  public router: Router;
  private userProxy: UserServiceProxy;

  constructor() {
    this.router = Router();
    this.userProxy = new UserServiceProxy();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * tags:
     *   name: Users
     *   description: User management endpoints
     */

    /**
     * @swagger
     * /api/user/profile:
     *   get:
     *     summary: Get user profile
     *     tags: [Users]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: User profile retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                 email:
     *                   type: string
     *                 username:
     *                   type: string
     *                 name:
     *                   type: string
     *                 age:
     *                   type: number
     *                 phoneNumber:
     *                   type: string
     *                 role:
     *                   type: string
     *                 reliabilityScore:
     *                   type: number
     *       401:
     *         description: Unauthorized
     */
    this.router.get(
      "/profile",
      authenticate,
      (req, res, next) => this.userProxy.handleGetProfile(req, res, next)
    );

    /**
     * @swagger
     * /api/user/profile:
     *   put:
     *     summary: Update user profile
     *     tags: [Users]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               username:
     *                 type: string
     *               name:
     *                 type: string
     *               age:
     *                 type: number
     *               phoneNumber:
     *                 type: string
     *     responses:
     *       200:
     *         description: Profile updated successfully
     *       400:
     *         description: Invalid input data
     *       401:
     *         description: Unauthorized
     */
    this.router.put(
      "/profile",
      authenticate,
      validateRequest(updateProfileSchema),
      (req, res, next) => this.userProxy.handleUpdateProfile(req, res, next)
    );

    /**
     * @swagger
     * /api/user/preferences:
     *   put:
     *     summary: Update user preferences
     *     tags: [Users]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - budget
     *               - groupSize
     *             properties:
     *               budget:
     *                 type: number
     *               petsAllowed:
     *                 type: boolean
     *               quiet:
     *                 type: boolean
     *               outdoor:
     *                 type: boolean
     *               wifi:
     *                 type: boolean
     *               parking:
     *                 type: boolean
     *               accessibility:
     *                 type: boolean
     *               studyPlace:
     *                 type: boolean
     *               noiseLevel:
     *                 type: string
     *                 enum: [QUIET, MODERATE, LOUD]
     *               preferredTime:
     *                 type: string
     *                 enum: [MORNING, AFTERNOON, EVENING, NIGHT]
     *               groupSize:
     *                 type: number
     *     responses:
     *       200:
     *         description: Preferences updated successfully
     *       400:
     *         description: Invalid input data
     *       401:
     *         description: Unauthorized
     */
    this.router.put(
      "/preferences",
      authenticate,
      validateRequest(updatePreferencesSchema),
      (req, res, next) => this.userProxy.handleUpdatePreferences(req, res, next)
    );

    /**
     * @swagger
     * /api/user/reliability-score:
     *   get:
     *     summary: Get user reliability score
     *     tags: [Users]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Reliability score retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 reliabilityScore:
     *                   type: number
     *                 lastUpdated:
     *                   type: string
     *                   format: date-time
     *       401:
     *         description: Unauthorized
     */
    this.router.get(
      "/reliability-score",
      authenticate,
      (req, res, next) => this.userProxy.handleGetReliabilityScore(req, res, next)
    );
  }
}