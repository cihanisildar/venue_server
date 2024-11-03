import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateAuth } from '../../../middleware/auth.middleware';

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