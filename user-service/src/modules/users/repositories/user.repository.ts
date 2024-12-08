import { PrismaClient } from "@prisma/client";
import { CreateUserProfileDTO } from "../interfaces/user.interface";
import {
  IUserProfile,
  IUserPreference,
  UpdateUserPreferenceDTO,
} from "../interfaces/user.interface";
// Repository
export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userData: CreateUserProfileDTO): Promise<IUserProfile> {
    return this.prisma.userProfile.create({
      data: {
        ...userData,
        reliabilityScore: 100.0, // Default score
      },
    });
  }

  async findById(userId: string): Promise<IUserProfile | null> {
    console.log("Querying user with ID:", userId); // Log the userId being queried
    return this.prisma.userProfile.findUnique({
      where: { id: userId }, // Ensure this matches the field name in your database
    });
  }

  async findByEmail(email: string): Promise<IUserProfile | null> {
    return this.prisma.userProfile.findUnique({
      where: { email },
    });
  }

  async findUserByUsername(username: string): Promise<IUserProfile | null> {
    return this.prisma.userProfile.findUnique({
      where: { username },
    });
  }

  async findUserPreferences(userId: string): Promise<IUserPreference | null> {
    const preferences = await this.prisma.userPreference.findFirst({
      where: { userId },
    });

    if (!preferences) return null;

    return {
      ...preferences,
      noiseLevel: preferences.noiseLevel ?? null,
      preferredTime: preferences.preferredTime ?? null,
    };
  }

  async updateUser(
    userId: string,
    profileData: Partial<IUserProfile>
  ): Promise<IUserProfile> {
    // Ensure that the user exists
    const existingUser = await this.prisma.userProfile.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Update the user profile
    const updatedUser = await this.prisma.userProfile.update({
      where: { id: userId },
      data: {
        ...profileData,
        updatedAt: new Date(), // Ensure updatedAt is always updated to the current time
      },
    });

    return updatedUser;
  }

  async updatePreferences(
    userId: string,
    preferencesData: UpdateUserPreferenceDTO
  ): Promise<IUserPreference> {
    const existingPreference = await this.prisma.userPreference.findFirst({
      where: { userId },
    });

    if (existingPreference) {
      const updated = await this.prisma.userPreference.update({
        where: { id: existingPreference.id },
        data: preferencesData,
      });

      return {
        ...updated,
        noiseLevel: updated.noiseLevel ?? null,
        preferredTime: updated.preferredTime ?? null,
      };
    }

    const created = await this.prisma.userPreference.create({
      data: {
        ...preferencesData,
        userId,
      },
    });

    return {
      ...created,
      noiseLevel: created.noiseLevel ?? null,
      preferredTime: created.preferredTime ?? null,
    };
  }

  async updateReliabilityScore(
    userId: string,
    score: number
  ): Promise<IUserProfile> {
    return this.prisma.userProfile.update({
      where: { id: userId },
      data: { reliabilityScore: score },
    });
  }

  async restrictUser(userId: string, until: Date): Promise<IUserProfile> {
    return this.prisma.userProfile.update({
      where: { id: userId },
      data: { restrictedUntil: until },
    });
  }
}
