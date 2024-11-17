import { UserRole, TimePreference, NoisePreference } from '@prisma/client';

export interface CreateUserDTO {
  email: string;
  username: string;
  age?: number;
  name: string;
  phoneNumber?: string;
  password: string; // This will be used to create UserAccount
  role?: UserRole;
}

export interface UpdateUserPreferenceDTO {
  budget: number;
  petsAllowed?: boolean;
  quiet?: boolean;
  outdoor?: boolean;
  wifi?: boolean;
  parking?: boolean;
  accessibility?: boolean;
  studyPlace?: boolean;
  noiseLevel?: NoisePreference;
  preferredTime?: TimePreference;
  groupSize: number;
}

// Additional interfaces if needed
export interface UserProfileDTO {
  id: string;
  email: string;
  username: string;
  age?: number;
  name: string;
  phoneNumber?: string;
  role: UserRole;
  reliabilityScore: number;
  restrictedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileDTO {
  email?: string;
  username?: string;
  age?: number;
  name?: string;
  phoneNumber?: string;
  role?: UserRole;
  restrictedUntil?: Date;
}
