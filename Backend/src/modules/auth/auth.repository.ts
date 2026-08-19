import { BaseTenantRepository } from '../../shared/repository/BaseTenantRepository.js';
import { IUser, UserModel } from './auth.model.js';

export class AuthRepository extends BaseTenantRepository<IUser> {
  constructor() {
    super(UserModel);
  }

  /**
   * Find user by email across all tenants for initial login lookup
   */
  async findByNormalizedEmailGlobal(normalizedEmail: string): Promise<IUser | null> {
    return this.model.findOne({ normalizedEmail }).select('+passwordHash +refreshTokens').exec();
  }

  /**
   * Find user by email within specific tenant
   */
  async findByNormalizedEmail(organizationId: string, normalizedEmail: string): Promise<IUser | null> {
    return this.model.findOne({ organizationId, normalizedEmail }).select('+passwordHash +refreshTokens').exec();
  }

  /**
   * Save refresh token for user session
   */
  async addRefreshToken(userId: string, token: string): Promise<void> {
    await this.model.updateOne({ _id: userId }, { $push: { refreshTokens: token } });
  }

  /**
   * Remove specific refresh token on logout
   */
  async removeRefreshToken(userId: string, token: string): Promise<void> {
    await this.model.updateOne({ _id: userId }, { $pull: { refreshTokens: token } });
  }

  /**
   * Clear all refresh tokens on remote logout/revoke
   */
  async clearAllRefreshTokens(userId: string): Promise<void> {
    await this.model.updateOne({ _id: userId }, { $set: { refreshTokens: [] } });
  }
}

export const authRepository = new AuthRepository();
