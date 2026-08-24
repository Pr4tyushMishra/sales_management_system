import { apiClient, withFallback } from '@/lib/apiClient';

export interface TenantOrgDto {
  id: string;
  organizationId: string;
  name: string;
  slug?: string;
  tier: 'ENTERPRISE_PLUS' | 'ENTERPRISE' | 'PRO';
  planTier?: 'STARTER' | 'BUSINESS' | 'ENTERPRISE';
  planStatus?: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  activeUsers: number;
  maxUsers: number;
  storageGb: number;
  apiCalls24h: number;
  health: 'HEALTHY' | 'WARNING' | 'DEGRADED';
  slaStatus: 'COMPLIANT' | 'AT_RISK';
  createdAt?: string;
}

export interface CreateTenantOrgDto {
  name: string;
  planTier?: 'STARTER' | 'BUSINESS' | 'ENTERPRISE';
  limits?: {
    maxUsers: number;
    maxLeads: number;
    maxStorageMb: number;
    aiTokensIncluded: number;
  };
  settings?: {
    timezone: string;
    currency: string;
    leadResponseSlaMinutes: number;
    allowTelephonyRecording: boolean;
  };
}

const FALLBACK_ORGS: TenantOrgDto[] = [
  { id: 'org_acme_corp', organizationId: 'org_acme_corp', name: 'Acme Enterprise Inc.', tier: 'ENTERPRISE_PLUS', planTier: 'ENTERPRISE', activeUsers: 6, maxUsers: 50, storageGb: 148, apiCalls24h: 184500, health: 'HEALTHY', slaStatus: 'COMPLIANT' },
  { id: 'org_apex_global', organizationId: 'org_apex_global', name: 'Apex Capital Logistics', tier: 'ENTERPRISE', planTier: 'BUSINESS', activeUsers: 4, maxUsers: 30, storageGb: 89, apiCalls24h: 92300, health: 'HEALTHY', slaStatus: 'COMPLIANT' },
  { id: 'org_nordic_tech', organizationId: 'org_nordic_tech', name: 'Nordic AI Solutions', tier: 'PRO', planTier: 'STARTER', activeUsers: 2, maxUsers: 15, storageGb: 34, apiCalls24h: 41200, health: 'WARNING', slaStatus: 'AT_RISK' },
  { id: 'org_finverve', organizationId: 'org_finverve', name: 'FinVerve Technologies', tier: 'ENTERPRISE', planTier: 'BUSINESS', activeUsers: 5, maxUsers: 40, storageGb: 112, apiCalls24h: 138000, health: 'HEALTHY', slaStatus: 'COMPLIANT' },
];

export const organizationsApi = {
  getOrganizations: async (): Promise<TenantOrgDto[]> => {
    return await withFallback(
      apiClient.get<TenantOrgDto[]>('/organizations'),
      FALLBACK_ORGS,
      'Tenant Organizations'
    );
  },

  getOrganizationById: async (id: string): Promise<TenantOrgDto> => {
    return await apiClient.get<TenantOrgDto>(`/organizations/${id}`);
  },

  createOrganization: async (dto: CreateTenantOrgDto): Promise<TenantOrgDto> => {
    return await apiClient.post<TenantOrgDto>('/organizations', dto);
  },
};
