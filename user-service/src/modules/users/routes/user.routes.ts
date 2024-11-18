import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateGatewayRequest } from '../../auth/middlewares/gateway-auth.middleware';

export const setupUserRoutes = (userController: UserController): Router => {
  const userRouter = Router();

  // Apply middleware to all routes except POST /profile
  userRouter.get('/profile', validateGatewayRequest, userController.getUserProfile);
  userRouter.put('/profile', validateGatewayRequest, userController.updateUserProfile);
  userRouter.patch('/preferences', validateGatewayRequest, userController.updateUserPreferences);
  userRouter.get('/reliability-score', validateGatewayRequest, userController.getUserReliabilityScore);

  // Route without the middleware
  userRouter.post('/profile', userController.createUserProfile);

  return userRouter;
};
