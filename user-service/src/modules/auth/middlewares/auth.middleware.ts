import { Request } from 'express';

// Only what the User Service needs to know about the authenticated user
export interface AuthenticatedUser {
  userId: string;
  email?: string;
  role?: string;
  reliabilityScore?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}