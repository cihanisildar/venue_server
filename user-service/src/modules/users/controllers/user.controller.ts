import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { AuthenticatedRequest } from "../../auth/interfaces/auth.interface";
import { CustomError } from "../../../common/errors/custom.error";

export class UserController {
  constructor(private readonly userService: UserService) {}

  public getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log("Incoming request:", {
        headers: req.headers,
        body: req.body,
      });
      // Check if x-user-id is an array and take the first element if it is
      const xUserId = req.headers["x-user-id"];
      const userId =
        req.user?.userId || (Array.isArray(xUserId) ? xUserId[0] : xUserId); // Handle both cases
      console.log("Extracted userId from token or header:", userId); // Log the userId

      if (!userId) {
        throw new CustomError("User ID is required", 400);
      }

      const userProfile = await this.userService.getUserProfile(userId);
      console.log("User profile retrieved:", userProfile); // Log the retrieved user profile

      if (!userProfile) {
        throw new CustomError("User not found", 404);
      }

      res.status(200).json(userProfile);
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };

  public createUserProfile = async (req: Request, res: Response) => {
    try {
      console.log("Incoming request for createUserProfile:", {
        headers: req.headers,
        body: req.body,
      });

      const userData = req.body; // Get user data from request body
      const userProfile = await this.userService.createUserProfile(userData); // Directly call the service method

      res.status(201).json(userProfile);
    } catch (error) {
      console.error("Failed to create user profile:", error);
      res.status(500).json({
        message: "Failed to create user profile",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  public getUserPreferences = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const userId = req.user?.userId; // Extract user ID from authenticated request
      if (!userId) {
        throw new CustomError("User ID is required", 400);
      }

      const preferences = await this.userService.getUserPreferences(userId); // Call service to get preferences
      res.status(200).json(preferences);
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };

  public updateUserPreferences = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError("User ID is required", 400);
      }

      const preferences = req.body;
      const updatedPreferences = await this.userService.updateUserPreferences(
        userId,
        preferences
      );
      res.status(200).json(updatedPreferences);
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };

  public getUserReliabilityScore = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError("User ID is required", 400);
      }

      const score = await this.userService.getUserReliabilityScore(userId);
      res.status(200).json({ reliabilityScore: score });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error("Unexpected error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };

  public updateUserProfile = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      console.log("Incoming request for updateUserProfile:", {
        headers: req.headers,
        body: req.body,
        user: req.user,
      });

      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError("User ID is required", 400);
      }

      const profileData = req.body; // Extract updated profile data from request body
      console.log("Profile data to update:", profileData);

      const updatedProfile = await this.userService.updateUserProfile(
        userId,
        profileData
      );
      console.log("Updated user profile:", updatedProfile);

      res.status(200).json(updatedProfile);
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error("Unexpected error while updating user profile:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };
}
