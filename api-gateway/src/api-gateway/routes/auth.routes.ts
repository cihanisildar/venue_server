import { RequestHandler, Router } from "express";
import { AuthServiceProxy } from "../proxy/auth.proxy"; // You'll need to create this

import { validateRequest } from "../middleware/validate-request.middleware";
import { loginUserSchema } from "../schemas/auth.schemas";
import { authenticate } from "../middleware/authenticate.middleware";
import { registerUserSchema } from "../schemas/auth.schemas";

export class AuthRoutes {
  public router: Router;
  private authProxy: AuthServiceProxy;

  constructor() {
    this.router = Router();
    this.authProxy = new AuthServiceProxy();
    this.initializeRoutes();

      // Debug logging
      console.log('Auth routes initialized with paths:', 
        this.router.stack.map(r => r.route?.path).filter(Boolean)
      );
  }
  

  private initializeRoutes() {
    // Public routes
    this.router.post(
      "/register",
      validateRequest(registerUserSchema) as RequestHandler,
      (req, res, next) => this.authProxy.handleRegister(req, res, next)
    );

    this.router.post(
      "/login",
      validateRequest(loginUserSchema) as RequestHandler,
      (req, res, next) => this.authProxy.handleLogin(req, res, next)
    );

    this.router.post("/refresh", (req, res, next) =>
      this.authProxy.handleRefresh(req, res, next)
    );

    // Protected routes
    this.router.post("/logout", (req, res, next) => 
      this.authProxy.handleLogout(req, res, next)
    );

    this.router.post(
      "/update-password",
      authenticate as RequestHandler,
      (req, res, next) => this.authProxy.handleUpdatePassword(req, res, next)
    );
  }
}
