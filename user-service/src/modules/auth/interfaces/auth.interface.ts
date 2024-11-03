import { Request } from 'express';

export interface UserPayload {
  userId: string;
  email?: string;
  role?: string;
  reliabilityScore?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}