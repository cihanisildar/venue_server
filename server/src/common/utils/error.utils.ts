import {
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ValidationError,
    DatabaseError,
    InternalServerError
  } from '../errors/custom.error';
  
  export const throwError = {
    badRequest: (message?: string): never => {
      throw new BadRequestError(message);
    },
  
    unauthorized: (message?: string): never => {
      throw new UnauthorizedError(message);
    },
  
    forbidden: (message?: string): never => {
      throw new ForbiddenError(message);
    },
  
    notFound: (message?: string): never => {
      throw new NotFoundError(message);
    },
  
    conflict: (message?: string): never => {
      throw new ConflictError(message);
    },
  
    validation: (message?: string): never => {
      throw new ValidationError(message);
    },
  
    database: (message?: string): never => {
      throw new DatabaseError(message);
    },
  
    internal: (message?: string): never => {
      throw new InternalServerError(message);
    }
  };