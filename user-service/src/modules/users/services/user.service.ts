import { CustomError } from "../../../common/errors/custom.error";
import {
  UpdateUserPreferenceDTO,
  IUserProfileResponse,
  IUserPreference,
} from "../interfaces/user.interface";
import { UserRepository } from "../repositories/user.repository";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserProfile(userId: string): Promise<IUserProfileResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    const preferences = await this.userRepository.findUserPreferences(userId);

    return {
      user: {
        ...user,
        preferences: preferences || undefined,
      },
    };
  }

  async updateUserPreferences(
    userId: string,
    preferences: UpdateUserPreferenceDTO
  ): Promise<IUserPreference> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    const updatedPreferences = await this.userRepository.updatePreferences(
      userId,
      preferences
    );
    return updatedPreferences;
  }

  async getUserReliabilityScore(userId: string): Promise<number> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    return user.reliabilityScore;
  }
}
