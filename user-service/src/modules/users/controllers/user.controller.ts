import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../../auth/interfaces/auth.interface';
import { CustomError } from '../../../common/errors/custom.error';

export class UserController {
  constructor(private readonly userService: UserService) {}

  public getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError('User ID is required', 400);
      }

      const userProfile = await this.userService.getUserProfile(userId);
      res.status(200).json(userProfile);
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  public updateUserPreferences = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError('User ID is required', 400);
      }

      const preferences = req.body;
      const updatedPreferences = await this.userService.updateUserPreferences(userId, preferences);
      res.status(200).json(updatedPreferences);
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };

  public getUserReliabilityScore = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new CustomError('User ID is required', 400);
      }

      const score = await this.userService.getUserReliabilityScore(userId);
      res.status(200).json({ reliabilityScore: score });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  };
}