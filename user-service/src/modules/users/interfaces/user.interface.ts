// interfaces/user.interface.ts
import { NoisePreference, TimePreference, UserRole } from "@prisma/client";

export interface IUserProfile {
  id: string;
  email: string;
  username: string;
  name?: string | null;
  surname?: string | null;
  birthdate?: Date | null;
  phoneNumber?: string | null;
  role?: UserRole;
  reliabilityScore?: number;
  restrictedUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPreference {
  id: string;
  userId: string;
  budget: number;
  petsAllowed: boolean;
  quiet: boolean;
  outdoor: boolean;
  wifi: boolean;
  parking: boolean;
  accessibility: boolean;
  studyPlace: boolean;
  noiseLevel: NoisePreference | null;
  preferredTime: TimePreference | null;
  groupSize: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProfileResponse extends IUserProfile {
  preferences?: IUserPreference;
}

// DTOs
export interface CreateUserProfileDTO {
  id: string;
  email: string;
  username: string;
  name?: string | null; // Allow null
  age?: number | null;
  phoneNumber?: string | null;
  role?: UserRole;
  reliabilityScore?: number; // Optional if you want to set a default in the repository
  restrictedUntil?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UpdateUserPreferenceDTO {
  budget: number;
  petsAllowed: boolean;
  quiet: boolean;
  outdoor: boolean;
  wifi: boolean;
  parking: boolean;
  accessibility: boolean;
  studyPlace: boolean;
  noiseLevel: NoisePreference | null;
  preferredTime: TimePreference | null;
  groupSize: number;
}
