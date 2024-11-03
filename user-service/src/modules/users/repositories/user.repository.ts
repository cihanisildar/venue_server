import { PrismaClient } from '@prisma/client';
import { 
  CreateUserDTO, 
  UpdateUserPreferenceDTO, 
  IUser, 
  IUserAccount, 
  IUserPreference 
} from '../interfaces/user.interface';

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(userData: CreateUserDTO): Promise<IUser> {
    return this.prisma.user.create({
      data: {
        ...userData,
        reliabilityScore: 100.0, // Default score
      }
    });
  }

  async findById(userId: string): Promise<IUser | null> {
    return this.prisma.user.findUnique({
      where: { id: userId }
    });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async findUserByUsername(username: string): Promise<IUser | null> {
    return this.prisma.user.findUnique({
      where: { username }
    });
  }

  async findUserPreferences(userId: string): Promise<IUserPreference | null> {
    const preferences = await this.prisma.userPreference.findFirst({
      where: { userId }
    });

    // If no preferences found, return null
    if (!preferences) return null;

    // Cast the Prisma result to our interface type
    return {
      ...preferences,
      noiseLevel: preferences.noiseLevel ?? null,
      preferredTime: preferences.preferredTime ?? null
    };
  }

  async updatePreferences(userId: string, preferences: UpdateUserPreferenceDTO): Promise<IUserPreference> {
    const existingPreference = await this.prisma.userPreference.findFirst({
      where: { userId }
    });

    if (existingPreference) {
      const updated = await this.prisma.userPreference.update({
        where: { id: existingPreference.id },
        data: preferences
      });

      return {
        ...updated,
        noiseLevel: updated.noiseLevel ?? null,
        preferredTime: updated.preferredTime ?? null
      };
    }

    const created = await this.prisma.userPreference.create({
      data: {
        userId,
        ...preferences
      }
    });

    return {
      ...created,
      noiseLevel: created.noiseLevel ?? null,
      preferredTime: created.preferredTime ?? null
    };
  }

  async updateReliabilityScore(userId: string, score: number): Promise<IUser> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { reliabilityScore: score }
    });
  }

  async restrictUser(userId: string, until: Date): Promise<IUser> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { restrictedUntil: until }
    });
  }
}