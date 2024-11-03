import { z } from "zod";
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    reliabilityScore: number;
  };
}

export const registerUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string(),
  age: z.number().optional(),
  phoneNumber: z.string().optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  age: z.number().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
});

// Token Payload schema
export const tokenPayloadSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: z.enum(["user", "admin", "moderator"]).default("user"),
  reliabilityScore: z.number(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

// Derive types from schemas
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserSchema>;
export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
