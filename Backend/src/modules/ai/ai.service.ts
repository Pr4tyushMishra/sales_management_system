import { AiGateway } from './ai.gateway.js';
import { leadRepository } from '../leads/lead.repository.js';
import { AppError } from '../../shared/errors/AppError.js';
import { LeadModel } from '../leads/lead.model.js';

export class AiService {
  async generateLeadSummary(organizationId: string, userId: string, leadId: string) {
    const lead = await leadRepository.findById(organizationId, leadId);
    if (!lead) {
      throw AppError.notFound('Lead');
    }

    const prompt = `Analyze this sales lead and generate a structured JSON summary:\nName: ${lead.name}\nCompany: ${lead.company}\nStatus: ${lead.status}\nBudget: ${lead.budget}\nRequirement: ${lead.requirement || 'Not specified'}\nSource: ${lead.source}\nScore: ${lead.score}`;

    const result = await AiGateway.execute({
      organizationId,
      userId,
      feature: 'lead_summary',
      prompt,
      systemInstruction: 'You are an enterprise Sales CRM AI assistant. Return clean JSON with fields: overview, intentLevel (HIGH/MEDIUM/LOW), suggestedAction, keyPoints (array).',
    });

    let summaryData;
    try {
      summaryData = JSON.parse(result.output);
    } catch {
      summaryData = {
        overview: result.output,
        intentLevel: 'MEDIUM',
        suggestedAction: 'Review requirement with lead',
        keyPoints: ['Inbound engagement detected'],
      };
    }

    // Save generated AI summary to Lead record
    await LeadModel.updateOne(
      { _id: leadId, organizationId },
      { $set: { aiSummary: { ...summaryData, isApproved: false } } }
    );

    return {
      aiSummary: summaryData,
      meta: {
        latencyMs: result.latencyMs,
        tokens: result.totalTokens,
        model: result.model,
      },
    };
  }

  async generateEmailDraft(
    organizationId: string,
    userId: string,
    data: { recipientName: string; context: string; goal: string }
  ) {
    const prompt = `Write a professional, high-converting sales outreach email:\nRecipient: ${data.recipientName}\nGoal: ${data.goal}\nContext: ${data.context}`;

    const result = await AiGateway.execute({
      organizationId,
      userId,
      feature: 'email_draft',
      prompt,
      systemInstruction: 'You are an expert sales representative. Write concise, polite, and persuasive emails.',
    });

    return {
      draft: result.output,
      meta: {
        latencyMs: result.latencyMs,
        tokens: result.totalTokens,
        model: result.model,
      },
    };
  }
}

export const aiService = new AiService();
