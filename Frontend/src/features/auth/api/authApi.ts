import { apiClient, withFallback } from '@/lib/apiClient';
import { UserRole, UserSession } from '@/types';

export interface LoginDto {
  email: string;
  password?: string;
  role?: UserRole;
  organizationId?: string;
}

export interface SignupDto {
  name: string;
  email: string;
  password?: string;
  organizationName: string;
  planTier?: 'STARTER' | 'BUSINESS' | 'ENTERPRISE';
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    organizationId: string;
    organizationName?: string;
    avatarUrl?: string;
    permissions?: string[];
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export const authApi = {
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    return await apiClient.post<AuthResponse>('/auth/login', dto);
  },

  signup: async (dto: SignupDto): Promise<AuthResponse> => {
    return await apiClient.post<AuthResponse>('/auth/signup', dto);
  },

  getMe: async (): Promise<{ user: UserSession } | null> => {
    return await withFallback(
      apiClient.get<{ user: UserSession }>('/auth/me'),
      null,
      'Auth Session Check'
    );
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (err) {
      console.warn('⚠️ Server logout failed, clearing local state:', err);
    }
  },
};
