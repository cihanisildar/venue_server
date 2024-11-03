import { Response, NextFunction } from 'express';
import { throwError } from '../../common/utils/error.utils';
import { AuthenticatedRequest } from '../interfaces/auth.interface';
import { UserRole } from '../interfaces/user-role.interface';

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throwError.unauthorized('User not authenticated');
      }

      const userRole = req.user!.role as UserRole;
      
      if (!allowedRoles.includes(userRole)) {
        throwError.forbidden('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};