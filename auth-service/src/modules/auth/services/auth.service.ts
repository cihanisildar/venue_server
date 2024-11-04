import { compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository';
import { RegisterUser, LoginUser, TokenPayload } from '../interfaces/auth.interface';
import prisma from '../../../../prisma/prisma';

export class AuthService {
  private repository: AuthRepository;
  private readonly JWT_ACCESS_SECRET = process.env.JWT_SECRET;
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor() {
    // Validate JWT secrets are properly configured
    if (!this.JWT_ACCESS_SECRET || !this.JWT_REFRESH_SECRET) {
      throw new Error('JWT secrets not properly configured');
    }
    this.repository = new AuthRepository();
  }

  async register(userData: RegisterUser) {
    const existingUser = await this.repository.findUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const existingUsername = await this.repository.findUserByUsername(userData.username);
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
    
    try {
      const tokens = await this.generateTokens(user);
      
      // Verify tokens exist before returning
      if (!tokens.accessToken || !tokens.refreshToken) {
        throw new Error('Token generation failed');
      }

      return { 
        user, 
        accessToken: tokens.accessToken, 
        refreshToken: tokens.refreshToken 
      };
    } catch (error) {
      console.error('Login token generation error:', error);
      throw new Error('Authentication failed');
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const decoded = verify(refreshToken, this.JWT_REFRESH_SECRET!) as TokenPayload;
      
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
    // Debug initial user data
    console.log('Generating tokens for user:', {
      userId: user.id,
      userEmail: user.email,
      userRole: user.role
    });

    if (!user || !user.id || !user.email) {
      throw new Error('Invalid user data for token generation');
    }

    // Debug environment variables
    console.log('JWT Secrets check:', {
      hasAccessSecret: !!this.JWT_ACCESS_SECRET,
      accessSecretLength: this.JWT_ACCESS_SECRET?.length,
      hasRefreshSecret: !!this.JWT_REFRESH_SECRET,
      refreshSecretLength: this.JWT_REFRESH_SECRET?.length,
      accessExpiry: this.ACCESS_TOKEN_EXPIRY,
      refreshExpiry: this.REFRESH_TOKEN_EXPIRY
    });

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role || 'user',
    };

    try {
      // Debug payload
      console.log('Token payload:', tokenPayload);

      const accessToken = sign(tokenPayload, this.JWT_ACCESS_SECRET!, { 
        expiresIn: this.ACCESS_TOKEN_EXPIRY 
      });

      const refreshToken = sign(tokenPayload, this.JWT_REFRESH_SECRET!, { 
        expiresIn: this.REFRESH_TOKEN_EXPIRY 
      });

      // Debug generated tokens
      console.log('Generated tokens:', {
        accessToken: accessToken ? `${accessToken.substring(0, 10)}...` : 'missing',
        accessTokenLength: accessToken?.length,
        refreshToken: refreshToken ? `${refreshToken.substring(0, 10)}...` : 'missing',
        refreshTokenLength: refreshToken?.length
      });

      // Verify tokens were generated successfully
      if (!accessToken || !refreshToken) {
        throw new Error('Failed to generate tokens');
      }

      // Save refresh token
      await this.repository.saveRefreshToken(user.id, refreshToken);

      // Debug final return value
      console.log('Returning tokens:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken
      });

      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Token generation error:', error);
      throw new Error('Failed to generate authentication tokens');
    }
  }

  async validateAccessToken(token: string): Promise<TokenPayload> {
    if (!token) {
      throw new Error('No token provided');
    }

    try {
      const decoded = verify(token, this.JWT_ACCESS_SECRET!) as TokenPayload;
      const user = await this.repository.findById(decoded.userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      if (user.restrictedUntil && user.restrictedUntil > new Date()) {
        throw new Error('Account is temporarily restricted');
      }

      return decoded;
    } catch (error) {
      console.error('Token validation error:', error);
      throw new Error('Invalid access token');
    }
  }

  async updatePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.repository.findById(userId);
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