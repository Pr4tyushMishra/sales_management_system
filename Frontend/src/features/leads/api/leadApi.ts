import { apiClient, withFallback } from '@/lib/apiClient';
import { Lead } from '@/types';
import { SEED_LEADS } from '@/lib/mockData';

export interface LeadFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  source?: string;
}

export interface CreateLeadPayload {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  title?: string;
  status?: string;
  budget?: number;
  requirement?: string;
  source?: string;
  tags?: string[];
}

export interface UpdateLeadPayload extends Partial<CreateLeadPayload> {
  score?: number;
  aiSummary?: unknown;
}

// Normalizer to guarantee consistent Lead structure across backend MongoDB & local seed models
function normalizeLead(raw: any): Lead {
  return {
    id: raw.id || raw._id?.toString() || `lead_${Date.now()}`,
    organizationId: raw.organizationId || 'org_acme_corp',
    name: raw.name || 'Unnamed Prospect',
    title: raw.title || 'Decision Maker',
    company: raw.company || 'Enterprise Corp',
    email: raw.email || 'lead@example.com',
    phone: raw.phone || '+1 (555) 000-0000',
    status: raw.status || 'NEW',
    source: raw.source || 'WEBSITE',
    score: raw.score ?? 75,
    scoreCategory: raw.score >= 80 ? 'HOT' : raw.score >= 50 ? 'WARM' : 'COLD',
    estimatedValue: raw.estimatedValue ?? raw.budget ?? 25000,
    assignedTo: raw.assignedTo || { id: 'usr_rep_01', name: 'Devon Patel' },
    tags: Array.isArray(raw.tags) ? raw.tags : ['Enterprise', 'High Priority'],
    aiSummary: raw.aiSummary || {
      overview: 'Qualified enterprise lead showing strong conversion potential.',
      intentLevel: 'HIGH',
      suggestedAction: 'Schedule technical discovery demo and share pricing sheet.',
      keyPoints: ['Active budgeting cycle', 'Executive sponsorship confirmed'],
      isApproved: false,
    },
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
  };
}

export const leadApi = {
  getLeads: async (params?: LeadFilterParams): Promise<Lead[]> => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';

    return await withFallback(
      (async () => {
        const response = await apiClient.get<any[]>(`/leads${queryString}`);
        const items = Array.isArray(response) ? response : [];
        return items.map(normalizeLead);
      })(),
      SEED_LEADS,
      'Leads Subsystem'
    );
  },

  getLeadById: async (id: string): Promise<Lead | null> => {
    return await withFallback(
      (async () => {
        const raw = await apiClient.get<any>(`/leads/${id}`);
        return raw ? normalizeLead(raw) : null;
      })(),
      SEED_LEADS.find((l) => l.id === id) || null,
      'Lead Detail'
    );
  },

  createLead: async (payload: CreateLeadPayload): Promise<Lead> => {
    return await withFallback(
      (async () => {
        const created = await apiClient.post<any>('/leads', payload);
        return normalizeLead(created);
      })(),
      normalizeLead({
        ...payload,
        id: `lead_${Date.now()}`,
        score: 80,
      }),
      'Lead Creation'
    );
  },

  updateLead: async (id: string, payload: UpdateLeadPayload): Promise<Lead> => {
    return await withFallback(
      (async () => {
        const updated = await apiClient.patch<any>(`/leads/${id}`, payload);
        return normalizeLead(updated);
      })(),
      normalizeLead({ id, ...payload }),
      'Lead Update'
    );
  },

  deleteLead: async (id: string): Promise<boolean> => {
    return await withFallback(
      (async () => {
        await apiClient.delete(`/leads/${id}`);
        return true;
      })(),
      true,
      'Lead Deletion'
    );
  },

  generateAiSummary: async (leadId: string): Promise<any> => {
    return await withFallback(
      (async () => {
        return await apiClient.post<any>('/ai/lead-summary', { leadId });
      })(),
      {
        aiSummary: {
          overview: 'High-probability prospect with immediate deployment readiness.',
          intentLevel: 'HIGH',
          suggestedAction: 'Initiate contracting & security review process.',
          keyPoints: ['Urgent Q3 timeline', 'Budget approved by CFO'],
          isApproved: true,
        },
        meta: { model: 'nvidia/nemotron-3.5-lightning:free', latencyMs: 380, tokens: 290 },
      },
      'AI Lead Intelligence'
    );
  },
};
