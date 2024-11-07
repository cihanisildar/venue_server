// services/user.service.ts
import { CustomError } from "../../../common/errors/custom.error";
import {
  UpdateUserPreferenceDTO,
  IUserProfileResponse,
  IUserPreference,
  IUserProfile,
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
      ...user,
      preferences: preferences || undefined,
    };
  }

  async createUserProfile(userData: IUserProfile): Promise<IUserProfileResponse> {
    // Ensure that userData contains necessary fields
    if (!userData.email || !userData.username) {
      throw new CustomError("Email and username are required", 400);
    }

    // Create user in the repository
    const newUser = await this.userRepository.create({
      ...userData,
    });

    return newUser; // Return the created user profile
  }

  async updateUserPreferences(
    userId: string,
    preferencesData: UpdateUserPreferenceDTO
  ): Promise<IUserPreference> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    return this.userRepository.updatePreferences(userId, preferencesData);
  }

  async getUserReliabilityScore(userId: string): Promise<number> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }
    return user.reliabilityScore;
  }
}
