import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validateGatewayRequest } from "../../auth/middlewares/gateway-auth.middleware";
import { validateInternalRequest } from "../../auth/middlewares/validate-internal-request.middleware";

export const setupUserRoutes = (userController: UserController): Router => {
  const userRouter = Router();

  // Apply middleware to all routes except POST /profile
  userRouter.get(
    "/profile",
    validateGatewayRequest,
    userController.getUserProfile
  );
  userRouter.put(
    "/profile",
    validateGatewayRequest,
    userController.updateUserProfile
  );
  userRouter.get(
    "/preferences",
    validateGatewayRequest,
    userController.getUserPreferences
  );
  userRouter.put(
    "/preferences",
    validateGatewayRequest,
    userController.updateUserPreferences
  );
  userRouter.get(
    "/reliability-score",
    validateGatewayRequest,
    userController.getUserReliabilityScore
  );

  // Route with internal requests
  userRouter.post(
    "/profile",
    validateInternalRequest, // Ensure only internal requests are allowed
    userController.createUserProfile
  );

  return userRouter;
};
