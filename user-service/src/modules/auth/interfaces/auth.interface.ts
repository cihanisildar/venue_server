import { Request } from 'express';

// Define the structure of the token payload
export interface TokenPayload {
  userId: string;
  email?: string;
  role?: string;
  reliabilityScore?: number;
}

// Define the user payload structure
export interface UserPayload {
  userId: string;
  email?: string;
  role?: string;
  reliabilityScore?: number;
}

// Extend the Request interface to include the user payload
export interface AuthenticatedRequest extends Request {
  user?: UserPayload; // This can be used for user data retrieved from the database
  tokenPayload?: TokenPayload; // This will hold the token payload information
}