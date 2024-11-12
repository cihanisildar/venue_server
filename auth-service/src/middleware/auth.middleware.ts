import { Router } from 'express';
import { AuthController } from '../modules/auth/controllers/auth.controller';
import { Response, NextFunction, RequestHandler } from 'express';
import { AuthService } from '../modules/auth/services/auth.service';
import { AuthenticatedRequest } from '../modules/auth/interfaces/auth.interface';

export const authRouter = Router();

export const setupAuthRoutes = (authController: AuthController): Router => {
  // Public routes (no auth needed)
  authRouter.post('/register', authController.register);
  authRouter.post('/login', authController.login);
  authRouter.post('/refresh', authController.refresh);
  authRouter.post('/logout', authController.logout);

  // Protected routes (require JWT validation)
  authRouter.use(validateAuth);
  authRouter.post('/update-password', authController.updatePassword);

  return authRouter;
};

export const validateAuth: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authService = new AuthService();
    const token = req.cookies?.vn_auth_token || req.header('Authorization')?.replace('Bearer ', '');
    console.log("Tokens baby:",token);
    console.log("Headers baby:", req.headers);
    
    
    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const decoded = await authService.validateAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      message: 'Invalid or expired token',
      error: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
};