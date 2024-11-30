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

  async createUserProfile(
    userData: IUserProfile
  ): Promise<IUserProfileResponse> {
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

  async updateUserProfile(
    userId: string,
    profileData: Partial<IUserProfile>
  ): Promise<IUserProfileResponse> {
    // Find the user to ensure they exist
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new CustomError("User not found", 404);
    }

    // Validate required fields if necessary
    if (profileData.email && !this.validateEmail(profileData.email)) {
      throw new CustomError("Invalid email format", 400);
    }

    // Update the user profile in the repository
    const updatedUser = await this.userRepository.updateUser(
      userId,
      profileData
    );

    // Fetch preferences if needed
    const preferences = await this.userRepository.findUserPreferences(userId);

    return {
      ...updatedUser,
      preferences: preferences || undefined,
    };
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async getUserPreferences(userId: string): Promise<IUserPreference | null> {
    const user = await this.userRepository.findById(userId); // Ensure user exists
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    return this.userRepository.findUserPreferences(userId); // Retrieve preferences from repository
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
    return user.reliabilityScore!;
  }
}
