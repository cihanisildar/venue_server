import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../../common/errors/custom.error';
import { ZodError } from 'zod';

interface ErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
  errors?: any;
  stack?: string;
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const response: ErrorResponse = {
    success: false,
    message: 'Internal server error',
  };

  // Custom errors
  if (err instanceof CustomError) {
    response.message = err.message;
    response.errorCode = err.errorCode;
    return res.status(err.statusCode).json(response);
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    response.message = 'Validation error';
    response.errorCode = 'VALIDATION_ERROR';
    response.errors = err.errors;
    return res.status(422).json(response);
  }

  // Handle specific error types based on error properties
  if ('code' in err) {
    const errorCode = (err as any).code;
    switch (errorCode) {
      case 'UNIQUE_CONSTRAINT_VIOLATION':
        response.message = 'Resource already exists';
        response.errorCode = errorCode;
        return res.status(409).json(response);
      case 'NOT_FOUND':
        response.message = 'Resource not found';
        response.errorCode = errorCode;
        return res.status(404).json(response);
      case 'DATABASE_ERROR':
        response.message = 'Service unavailable';
        response.errorCode = errorCode;
        return res.status(503).json(response);
    }
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(500).json(response);
};