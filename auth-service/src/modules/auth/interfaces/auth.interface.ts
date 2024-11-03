import { z } from "zod";
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const registerUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  // Make these fields optional
  name: z.string().optional(),
  age: z.number().optional(),
  phoneNumber: z.string().optional(),
}).strict(); // This will reject any additional properties not defined in the schema

export const loginUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
}).strict();

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
});

// Token Payload schema
export const tokenPayloadSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: z.enum(["user", "admin", "moderator"]).default("user"),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

// Derive types from schemas
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserSchema>;
export type TokenPayload = z.infer<typeof tokenPayloadSchema>;
