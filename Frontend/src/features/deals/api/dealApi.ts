import { apiClient, withFallback } from '@/lib/apiClient';
import { Deal, DealStage } from '@/types';
import { SEED_DEALS } from '@/lib/mockData';

export interface CreateDealPayload {
  title: string;
  value: number;
  currency?: string;
  stage?: DealStage;
  probability?: number;
  expectedCloseDate?: string;
  leadId?: string;
  contactName?: string;
  company?: string;
  ownerId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface UpdateDealPayload extends Partial<CreateDealPayload> {}

function normalizeDeal(raw: any): Deal {
  return {
    id: raw.id || raw._id?.toString() || `deal_${Date.now()}`,
    organizationId: raw.organizationId || 'org_acme_corp',
    title: raw.title || 'Enterprise Expansion',
    company: raw.company || 'Global Tech',
    contactName: raw.contactName || 'Lead Executive',
    value: raw.value ?? 75000,
    stage: (raw.stage as DealStage) || 'DISCOVERY',
    probability: raw.probability ?? 60,
    expectedCloseDate: raw.expectedCloseDate ? new Date(raw.expectedCloseDate).toISOString().split('T')[0] : '2026-09-30',
    assignedTo: raw.assignedTo || { id: 'usr_rep_01', name: 'Devon Patel' },
    health: raw.health || 'HEALTHY',
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toISOString() : 'Just now',
  };
}

export const dealApi = {
  getDeals: async (): Promise<Deal[]> => {
    return await withFallback(
      (async () => {
        const response = await apiClient.get<any[]>('/deals');
        const items = Array.isArray(response) ? response : [];
        return items.map(normalizeDeal);
      })(),
      SEED_DEALS,
      'Deals Pipeline Subsystem'
    );
  },

  getDealById: async (id: string): Promise<Deal | null> => {
    return await withFallback(
      (async () => {
        const raw = await apiClient.get<any>(`/deals/${id}`);
        return raw ? normalizeDeal(raw) : null;
      })(),
      SEED_DEALS.find((d) => d.id === id) || null,
      'Deal Detail'
    );
  },

  createDeal: async (payload: CreateDealPayload): Promise<Deal> => {
    return await withFallback(
      (async () => {
        const created = await apiClient.post<any>('/deals', payload);
        return normalizeDeal(created);
      })(),
      normalizeDeal({
        ...payload,
        id: `deal_${Date.now()}`,
      }),
      'Deal Creation'
    );
  },

  updateDeal: async (id: string, payload: UpdateDealPayload): Promise<Deal> => {
    return await withFallback(
      (async () => {
        const updated = await apiClient.patch<any>(`/deals/${id}`, payload);
        return normalizeDeal(updated);
      })(),
      normalizeDeal({ id, ...payload }),
      'Deal Update'
    );
  },

  deleteDeal: async (id: string): Promise<boolean> => {
    return await withFallback(
      (async () => {
        await apiClient.delete(`/deals/${id}`);
        return true;
      })(),
      true,
      'Deal Deletion'
    );
  },
};
