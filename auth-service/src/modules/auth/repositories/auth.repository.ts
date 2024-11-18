import * as bcrypt from "bcrypt";
import * as crypto from "crypto";

import { RegisterUser } from "../interfaces/auth.interface";
import prisma from "../../../../prisma/prisma";

export class AuthRepository {
  async createUser(userData: RegisterUser) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return prisma.authUser.create({
      data: {
        email: userData.email,
        username: userData.username,
        account: {
          create: {
            hashedPassword,
            salt,
          },
        },
        refreshTokens: { create: [] },
      },
      include: {
        account: true,
      },
    });
  }

  async createUserForAuthService(userData: RegisterUser) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create the user but return only necessary details
    const authUser = await prisma.authUser.create({
      data: {
        email: userData.email,
        username: userData.username,
        account: {
          create: {
            hashedPassword,
            salt,
          },
        },
        refreshTokens: { create: [] },
      },
      include: {
        account: true,
      },
    });

    // Destructure to get only the necessary fields
    const { id, email, username } = authUser;

    // Return just the necessary fields
    return { id, email, username };
  }

  async findUserByEmail(email: string) {
    return prisma.authUser.findUnique({
      where: { email },
      include: {
        account: true,
      },
    });
  }

  async findUserByUsername(username: string) {
    return prisma.authUser.findUnique({
      where: { username },
      include: {
        account: true,
      },
    });
  }

  async findById(userId: string) {
    return prisma.authUser.findUnique({
      where: { id: userId },
      include: {
        account: true,
      },
    });
  }

  async updatePassword(userId: string, newPassword: string) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return prisma.userAccount.update({
      where: { userId },
      data: {
        hashedPassword,
        salt,
        passwordChangedAt: new Date(),
      },
    });
  }

  async updateLastLogin(userId: string) {
    return prisma.userAccount.update({
      where: { userId },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  async saveRefreshToken(userId: string, refreshToken: string) {
    return prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.delete({
      where: { token },
    });
  }

  async deleteAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async deleteUser(userId: string) {
    // First, delete related refresh token records
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Then, delete related user account records
    await prisma.userAccount.deleteMany({
      where: { userId },
    });

    // Finally, delete the user
    return prisma.authUser.delete({
      where: { id: userId },
    });
  }
}
