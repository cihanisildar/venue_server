import { compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository';
import { RegisterUser, LoginUser, TokenPayload } from '../interfaces/auth.interface';
import { UserRepository } from '../../users/repositories/user.repository';
import prisma from '../../../../prisma/prisma';

export class AuthService {
  private repository: AuthRepository;
  private userRepository: UserRepository;
  private readonly JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-key';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor() {
    this.repository = new AuthRepository();
    this.userRepository = new UserRepository(prisma);
  }

  async register(userData: RegisterUser) {
    const existingUser = await this.repository.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const existingUsername = await this.userRepository.findUserByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    const user = await this.repository.createUser(userData);
    const { accessToken, refreshToken } = await this.generateTokens(user);
    
    await this.repository.updateLastLogin(user.id);
    
    return { user, accessToken, refreshToken };
  }

  async login(loginData: LoginUser) {
    const user = await this.repository.findUserByEmail(loginData.email);
    if (!user || !user.account) {
      throw new Error('Invalid credentials');
    }

    if (user.restrictedUntil && user.restrictedUntil > new Date()) {
      throw new Error('Account is temporarily restricted');
    }

    const isPasswordValid = await compare(loginData.password, user.account.hashedPassword);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    await this.repository.deleteAllUserRefreshTokens(user.id);
    await this.repository.updateLastLogin(user.id);
    
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return { user, accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const decoded = verify(refreshToken, this.JWT_REFRESH_SECRET) as TokenPayload;
      
      const storedToken = await this.repository.findRefreshToken(refreshToken);
      if (!storedToken || !storedToken.user) {
        throw new Error('Invalid refresh token');
      }

      if (storedToken.user.restrictedUntil && storedToken.user.restrictedUntil > new Date()) {
        throw new Error('Account is temporarily restricted');
      }

      await this.repository.deleteRefreshToken(refreshToken);

      const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(storedToken.user);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      await this.repository.deleteRefreshToken(refreshToken);
    } catch (error) {
      // Ignore errors during logout
    }
  }

  private async generateTokens(user: any) {
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role || 'user',
      reliabilityScore: user.reliabilityScore
    };

    const accessToken = sign(tokenPayload, this.JWT_ACCESS_SECRET, { 
      expiresIn: this.ACCESS_TOKEN_EXPIRY 
    });

    const refreshToken = sign(tokenPayload, this.JWT_REFRESH_SECRET, { 
      expiresIn: this.REFRESH_TOKEN_EXPIRY 
    });

    await this.repository.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async validateAccessToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = verify(token, this.JWT_ACCESS_SECRET) as TokenPayload;
      const user = await this.userRepository.findById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      if (user.restrictedUntil && user.restrictedUntil > new Date()) {
        throw new Error('Account is temporarily restricted');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.account) {
      throw new Error('User not found');
    }

    const isPasswordValid = await compare(oldPassword, user.account.hashedPassword);
    if (!isPasswordValid) {
      throw new Error('Invalid current password');
    }

    await this.repository.updatePassword(userId, newPassword);
    await this.repository.deleteAllUserRefreshTokens(userId);

    return { message: 'Password updated successfully' };
  }
}