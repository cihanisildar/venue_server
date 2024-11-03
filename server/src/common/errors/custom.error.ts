export class CustomError extends Error {
    constructor(
      public message: string,
      public statusCode: number = 400,
      public errorCode?: string
    ) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class BadRequestError extends CustomError {
    constructor(message: string = 'Bad Request') {
      super(message, 400, 'BAD_REQUEST');
    }
  }
  
  export class UnauthorizedError extends CustomError {
    constructor(message: string = 'Unauthorized') {
      super(message, 401, 'UNAUTHORIZED');
    }
  }
  
  export class ForbiddenError extends CustomError {
    constructor(message: string = 'Forbidden') {
      super(message, 403, 'FORBIDDEN');
    }
  }
  
  export class NotFoundError extends CustomError {
    constructor(message: string = 'Resource not found') {
      super(message, 404, 'NOT_FOUND');
    }
  }
  
  export class ConflictError extends CustomError {
    constructor(message: string = 'Resource already exists') {
      super(message, 409, 'CONFLICT');
    }
  }
  
  export class ValidationError extends CustomError {
    constructor(message: string = 'Validation failed') {
      super(message, 422, 'VALIDATION_ERROR');
    }
  }
  
  export class DatabaseError extends CustomError {
    constructor(message: string = 'Database error occurred') {
      super(message, 500, 'DATABASE_ERROR');
    }
  }
  
  export class InternalServerError extends CustomError {
    constructor(message: string = 'Internal server error') {
      super(message, 500, 'INTERNAL_SERVER_ERROR');
    }
  }