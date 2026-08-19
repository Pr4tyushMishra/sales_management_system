import { apiClient, withFallback } from '@/lib/apiClient';

export interface LeadSummaryResponse {
  aiSummary: {
    overview: string;
    intentLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    suggestedAction: string;
    keyPoints: string[];
    isApproved?: boolean;
  };
  meta: {
    latencyMs: number;
    tokens: number;
    model: string;
  };
}

export interface EmailDraftPayload {
  recipientName: string;
  context: string;
  goal: string;
}

export interface EmailDraftResponse {
  draft: string;
  meta: {
    latencyMs: number;
    tokens: number;
    model: string;
  };
}

export const aiApi = {
  generateLeadSummary: async (leadId: string): Promise<LeadSummaryResponse> => {
    return await withFallback(
      apiClient.post<LeadSummaryResponse>('/ai/lead-summary', { leadId }),
      {
        aiSummary: {
          overview: 'High-intent enterprise opportunity evaluating CRM automation for RevOps consolidation.',
          intentLevel: 'HIGH',
          suggestedAction: 'Schedule technical discovery and provide custom SLA proposal.',
          keyPoints: ['Budget approved above $25k', 'Decision maker active on platform'],
          isApproved: false,
        },
        meta: {
          latencyMs: 420,
          tokens: 310,
          model: 'nvidia/nemotron-3.5-lightning:free',
        },
      },
      'AI Lead Analysis'
    );
  },

  generateEmailDraft: async (payload: EmailDraftPayload): Promise<EmailDraftResponse> => {
    return await withFallback(
      apiClient.post<EmailDraftResponse>('/ai/email-draft', payload),
      {
        draft: `Hi ${payload.recipientName},\n\nThank you for reaching out regarding ${payload.context}. I would love to connect and discuss how we can help you achieve ${payload.goal}.\n\nWould you have 15 minutes this week for a brief walkthrough?\n\nBest regards,\nADVMEN Sales Operations`,
        meta: {
          latencyMs: 380,
          tokens: 240,
          model: 'nvidia/nemotron-3.5-lightning:free',
        },
      },
      'AI Email Generation'
    );
  },
};
