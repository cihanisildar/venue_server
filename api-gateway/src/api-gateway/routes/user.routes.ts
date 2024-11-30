import { Router } from "express";
import { authenticate } from "../middleware/authenticate.middleware";
import { UserServiceProxy } from "../proxy/user.proxy";

export class UserRoutes {
  public router: Router;
  private userProxy: UserServiceProxy;

  constructor() {
    this.router = Router();
    this.userProxy = new UserServiceProxy();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/profile", authenticate, (req, res, next) =>
      this.userProxy.handleGetProfile(req, res, next)
    );

    this.router.post("/profile", (req, res, next) =>
      this.userProxy.handleCreateUser(req, res, next)
    );

    this.router.put("/profile", authenticate, (req, res, next) =>
      this.userProxy.handleUpdateProfile(req, res, next)
    );

    this.router.get("/preferences", authenticate, (req, res, next) =>
      this.userProxy.handleGetPreferences(req, res, next)
    );

    this.router.put("/preferences", authenticate, (req, res, next) =>
      this.userProxy.handleUpdatePreferences(req, res, next)
    );

    this.router.get("/reliability-score", authenticate, (req, res, next) =>
      this.userProxy.handleGetReliabilityScore(req, res, next)
    );
  }
}
