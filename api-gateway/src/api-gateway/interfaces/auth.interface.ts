import { z } from "zod";
import { Request } from "express";
import { UserRole } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

// // Move schemas to separate file if needed
// export const registerUserSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(6),
//   username: z.string().min(3),
//   name: z.string().optional(),
//   age: z.number().optional(),
//   phoneNumber: z.string().optional(),
// });

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  reliabilityScore: number;
}
