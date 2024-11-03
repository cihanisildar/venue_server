import { NoisePreference, TimePreference, UserAccount, UserRole } from "@prisma/client";

// Base User Interface
export interface IUser {
  id: string;
  email: string;
  username: string;
  account?: UserAccount | null;
  age: number | null;
  name: string;
  phoneNumber: string | null;
  role: UserRole;
  reliabilityScore: number;
  restrictedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// User Account Interface
export interface IUserAccount {
  id: string;
  userId: string;
  hashedPassword: string;
  salt: string;
  lastLoginAt: Date | null;
  passwordChangedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// User Preferences Interface
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
  noiseLevel?: NoisePreference | null;
  preferredTime?: TimePreference | null;
  groupSize: number;
  createdAt: Date;
  updatedAt: Date;
}

// DTO Interfaces
export interface CreateUserDTO {
  email: string;
  username: string;
  name: string;
  age?: number;
  phoneNumber?: string;
  role?: UserRole;
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

// Response interfaces
export interface IUserResponse extends Omit<IUser, "restrictedUntil"> {
  age: number | null;
  phoneNumber: string | null;
  preferences?: IUserPreference;
}

export interface IUserProfileResponse {
  user: IUserResponse;
  account?: Omit<IUserAccount, "hashedPassword" | "salt">;
}