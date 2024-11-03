import { Express } from 'express';
import { authenticate } from '../middleware/authenticate.middleware';
import { validateRequest } from '../middleware/validate-request.middleware';
import { AuthServiceProxy } from '../proxy/auth.proxy';
import { UserServiceProxy } from '../proxy/user.proxy';
import { registerUserSchema, loginUserSchema } from '../schemas/auth.schemas';

export function configureRoutes(app: Express): void {
  const authProxy = new AuthServiceProxy();
  const userProxy = new UserServiceProxy();

  // Auth Routes
  app.post(
    '/api/auth/register',
    validateRequest(registerUserSchema),
    (req, res, next) => authProxy.handleRegister(req, res, next)
  );

  app.post(
    '/api/auth/login',
    validateRequest(loginUserSchema),
    (req, res, next) => authProxy.handleLogin(req, res, next)
  );

  app.post(
    '/api/auth/refresh',
    (req, res, next) => authProxy.handleRefresh(req, res, next)
  );

  app.post(
    '/api/auth/logout',
    authenticate,
    (req, res, next) => authProxy.handleLogout(req, res, next)
  );

  app.put(
    '/api/auth/password',
    authenticate,
    (req, res, next) => authProxy.handleUpdatePassword(req, res, next)
  );

  // User Routes
  app.get(
    '/api/users/profile',
    // authenticate, 
    (req, res, next) => userProxy.handleGetProfile(req, res, next)
  );

  app.put(
    '/api/users/preferences',
    authenticate,
    (req, res, next) => userProxy.handleUpdatePreferences(req, res, next)
  );

  app.get(
    '/api/users/reliability-score',
    // authenticate,
    (req, res, next) => userProxy.handleGetReliabilityScore(req, res, next)
  );
}