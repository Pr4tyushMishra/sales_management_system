import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/AppError.js';
import { ERROR_CODES } from '../../shared/errors/errorCodes.js';
import { USER_ROLES, UserRole, ROLE_DEFAULT_PERMISSIONS } from '../../config/constants.js';

import { normalizeEmail } from '../../shared/utils/normalize.js';
import { authRepository } from './auth.repository.js';
import { OrganizationModel } from '../organizations/organization.model.js';
import { IUser } from './auth.model.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponsePayload {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    organizationId: string;
    organizationName?: string;
    avatarUrl?: string;
    permissions: string[];
  };
  tokens: AuthTokens;
}

export class AuthService {
  /**
   * Generates JWT Access and Refresh tokens
   */
  private generateTokens(user: IUser, organizationName?: string): AuthTokens {
    const payload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organizationName,
      permissions: user.permissions,
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(
      { id: user._id.toString(), organizationId: user.organizationId },
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    };
  }

  /**
   * Register a new company/organization and its primary Admin user
   */
  async signup(data: {
    organizationName: string;
    name: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<AuthResponsePayload> {
    const normalizedEmail = normalizeEmail(data.email);

    // Check if user with email already exists globally
    const existingUser = await authRepository.findByNormalizedEmailGlobal(normalizedEmail);
    if (existingUser) {
      throw AppError.conflict('An account with this email already exists');
    }

    // 1. Create Organization
    const organizationId = `org_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
    const slug = data.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const org = await OrganizationModel.create({
      organizationId,
      name: data.organizationName,
      slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
    });

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // 3. Create Primary Admin User
    const role = data.role || USER_ROLES.ORG_ADMIN;
    const user = await authRepository.create(organizationId, {
      organizationId,
      name: data.name,
      email: data.email,
      normalizedEmail,
      passwordHash,
      role,
      permissions: ROLE_DEFAULT_PERMISSIONS[role] || [],
      isActive: true,
      isEmailVerified: true,
    });

    // 4. Issue Tokens
    const tokens = this.generateTokens(user, org.name);
    await authRepository.addRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: org.name,
        avatarUrl: user.avatarUrl,
        permissions: user.permissions,
      },
      tokens,
    };
  }

  /**
   * Login user by email and password
   */
  async login(data: { email: string; password: string }): Promise<AuthResponsePayload> {
    const normalizedEmail = normalizeEmail(data.email);

    const user = await authRepository.findByNormalizedEmailGlobal(normalizedEmail);
    if (!user) {
      throw AppError.unauthorized('Invalid email or password', ERROR_CODES.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw AppError.forbidden('Your account has been deactivated. Please contact your organization administrator.');
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password', ERROR_CODES.INVALID_CREDENTIALS);
    }

    // Retrieve organization details
    const org = await OrganizationModel.findOne({ organizationId: user.organizationId });

    // Update last login
    await authRepository.updateById(user.organizationId, user._id.toString(), {
      lastLoginAt: new Date(),
    });

    // Generate tokens & rotate refresh token
    const tokens = this.generateTokens(user, org?.name);
    await authRepository.addRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: org?.name || 'ADVMEN Workspace',
        avatarUrl: user.avatarUrl,
        permissions: user.permissions,
      },
      tokens,
    };
  }

  /**
   * Rotate access token using valid refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        id: string;
        organizationId: string;
      };

      const user = await authRepository.findById(decoded.organizationId, decoded.id);
      if (!user || !user.isActive) {
        throw AppError.unauthorized('Invalid or expired refresh token');
      }

      const org = await OrganizationModel.findOne({ organizationId: user.organizationId });
      const newTokens = this.generateTokens(user, org?.name);

      // Rotate: remove old, save new
      await authRepository.removeRefreshToken(user._id.toString(), refreshToken);
      await authRepository.addRefreshToken(user._id.toString(), newTokens.refreshToken);

      return newTokens;
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token', ERROR_CODES.TOKEN_EXPIRED);
    }
  }

  /**
   * Invalidate refresh token on logout
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await authRepository.removeRefreshToken(userId, refreshToken);
    } else {
      await authRepository.clearAllRefreshTokens(userId);
    }
  }
}

export const authService = new AuthService();
