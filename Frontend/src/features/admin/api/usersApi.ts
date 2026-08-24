import { apiClient, withFallback } from '@/lib/apiClient';
import { UserRole } from '@/types';

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatarUrl?: string;
  organizationId: string;
  isActive: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatarUrl?: string;
  organizationId?: string;
}

export interface UpdateUserDto {
  name?: string;
  role?: UserRole;
  department?: string;
  phone?: string;
  avatarUrl?: string;
  isActive?: boolean;
  password?: string;
}

export interface UserListResponse {
  items: UserDto[];
  page: number;
  totalPages: number;
  total: number;
}

const FALLBACK_USERS: UserDto[] = [
  { id: 'usr_sarah_01', name: 'Sarah Chen', role: 'ORG_ADMIN', email: 'sarah.c@acmecorp.com', organizationId: 'org_acme_corp', department: 'Executive Ops', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', isActive: true },
  { id: 'usr_marcus_02', name: 'Marcus Vance', role: 'SALES_MANAGER', email: 'marcus.v@acmecorp.com', organizationId: 'org_acme_corp', department: 'Global Sales', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', isActive: true },
  { id: 'usr_devon_03', name: 'Devon Patel', role: 'SALES_REP', email: 'devon.p@acmecorp.com', organizationId: 'org_acme_corp', department: 'Mid-Market Sales', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', isActive: true },
  { id: 'usr_elena_04', name: 'Elena Rostova', role: 'TELECALLER', email: 'elena.r@acmecorp.com', organizationId: 'org_acme_corp', department: 'Outreach & Telephony', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', isActive: true },
  { id: 'usr_jordan_05', name: 'Jordan Miller', role: 'MARKETING_SDR', email: 'jordan.m@acmecorp.com', organizationId: 'org_acme_corp', department: 'Inbound Demand', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', isActive: true },
  { id: 'usr_victoria_06', name: 'Victoria Cross', role: 'FINANCE_VIEWER', email: 'victoria.c@acmecorp.com', organizationId: 'org_acme_corp', department: 'Finance & Billing', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', isActive: true },
];

export const usersApi = {
  getUsers: async (params?: { organizationId?: string; role?: string; search?: string }): Promise<UserDto[]> => {
    const searchParams = new URLSearchParams();
    if (params?.organizationId) searchParams.set('organizationId', params.organizationId);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.search) searchParams.set('search', params.search);

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';

    return await withFallback(
      apiClient.get<UserDto[]>(`/users${queryStr}`),
      FALLBACK_USERS,
      'User Roster'
    );
  },

  getUserById: async (id: string): Promise<UserDto> => {
    return await apiClient.get<UserDto>(`/users/${id}`);
  },

  createUser: async (dto: CreateUserDto): Promise<UserDto> => {
    return await apiClient.post<UserDto>('/users', dto);
  },

  updateUser: async (id: string, dto: UpdateUserDto): Promise<UserDto> => {
    return await apiClient.patch<UserDto>(`/users/${id}`, dto);
  },

  deleteUser: async (id: string): Promise<{ deleted: boolean }> => {
    return await apiClient.delete<{ deleted: boolean }>(`/users/${id}`);
  },
};
