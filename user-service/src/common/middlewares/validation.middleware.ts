// import { Router } from 'express';
// import { UserController } from '../../modules/users/controllers/user.controller';
// import { validateGatewayRequest } from '../../modules/auth/middlewares/gateway-auth.middleware';

// export const userRouter = Router();

// export const setupUserRoutes = (userController: UserController): Router => {
//   // Apply gateway validation middleware to all routes in the userRouter
//   userRouter.use(validateGatewayRequest);

//   console.log("It reaches the validation");
  
//   // Define user routes
//   userRouter.get('/profile', userController.getUserProfile); // Route to get user profile details
//   userRouter.post('/profile', userController.createUserProfile); // Route to create a user profile
//   userRouter.put('/profile', userController.updateUserProfile); // Route to create a user profile
//   userRouter.patch('/preferences', userController.updateUserPreferences); // Route to update user preferences
//   userRouter.get('/reliability-score', userController.getUserReliabilityScore); // Route to retrieve user's reliability score

//   return userRouter;
// };
