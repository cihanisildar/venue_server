import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateGatewayRequest } from '../../auth/middlewares/gateway-auth.middleware';

export const userRouter = Router();

export const setupUserRoutes = (userController: UserController): Router => {
  // Apply gateway validation middleware to all routes
  userRouter.use(validateGatewayRequest);

  // User routes
  userRouter.get('/profile', userController.getUserProfile);
  userRouter.post('/profile', userController.createUserProfile);
  userRouter.patch('/preferences', userController.updateUserPreferences);
  userRouter.get('/reliability-score', userController.getUserReliabilityScore);

  return userRouter;
};