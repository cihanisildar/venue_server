import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import prisma from '../../../../prisma/prisma';
import { RegisterUser } from '../interfaces/auth.interface';

export class AuthRepository {
  async createUser(userData: RegisterUser) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    return prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        name: userData.name,
        age: userData.age,
        phoneNumber: userData.phoneNumber,
        reliabilityScore: 100.0,
        account: {
          create: {
            hashedPassword,
            salt,
          }
        },
        refreshTokens: { create: [] }
      },
      include: {
        account: true
      }
    });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        account: true
      }
    });
  }

  async updatePassword(userId: string, newPassword: string) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return prisma.userAccount.update({
      where: { userId },
      data: {
        hashedPassword,
        salt,
        passwordChangedAt: new Date()
      }
    });
  }

  async updateLastLogin(userId: string) {
    return prisma.userAccount.update({
      where: { userId },
      data: {
        lastLoginAt: new Date()
      }
    });
  }

  async saveRefreshToken(userId: string, refreshToken: string) {
    return prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true }
    });
  }

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.delete({
      where: { token }
    });
  }

  async deleteAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({
      where: { userId }
    });
  }
}