import { leadRepository } from './lead.repository.js';
import { normalizePhone, normalizeEmail } from '../../shared/utils/normalize.js';
import { AppError } from '../../shared/errors/AppError.js';
import { eventBus } from '../../shared/events/EventBus.js';
import { ILead, LeadScoreCategory, SlaStatus } from './lead.model.js';
import { UserModel } from '../auth/auth.model.js';
import { USER_ROLES } from '../../config/constants.js';

export class LeadService {
  /**
   * Compute initial AI/rule-based score based on signals
   */
  private calculateInitialScore(data: {
    source: string;
    budget?: number;
    requirement?: string;
  }): { score: number; scoreCategory: LeadScoreCategory } {
    let score = 50;

    if (data.source === 'INBOUND_CALL' || data.source === 'WEBSITE') {
      score += 20;
    } else if (data.source === 'META_ADS' || data.source === 'GOOGLE_ADS') {
      score += 15;
    } else if (data.source === 'REFERRAL') {
      score += 25;
    }

    if (data.budget && data.budget >= 50000) {
      score += 20;
    } else if (data.budget && data.budget >= 10000) {
      score += 10;
    }

    if (data.requirement && data.requirement.length > 30) {
      score += 10;
    }

    score = Math.min(100, Math.max(0, score));
    let scoreCategory: LeadScoreCategory = 'WARM';
    if (score >= 75) scoreCategory = 'HOT';
    else if (score < 40) scoreCategory = 'COLD';

    return { score, scoreCategory };
  }

  /**
   * Automatically select next sales rep via round-robin
   */
  private async getNextRoundRobinOwner(organizationId: string): Promise<{
    id: string;
    name: string;
    avatarUrl?: string;
  } | null> {
    const salesReps = await UserModel.find({
      organizationId,
      role: { $in: [USER_ROLES.SALES_REP, USER_ROLES.TELECALLER] },
      isActive: true,
    })
      .sort({ updatedAt: 1 })
      .limit(1)
      .lean();

    if (salesReps.length > 0) {
      const rep = salesReps[0];
      // Touch updatedAt to rotate
      await UserModel.updateOne({ _id: rep._id }, { $set: { updatedAt: new Date() } });
      return {
        id: rep._id.toString(),
        name: rep.name,
        avatarUrl: rep.avatarUrl,
      };
    }

    return null;
  }

  /**
   * Create or capture a new lead with deduplication check
   */
  async createLead(
    organizationId: string,
    leadData: Partial<ILead> & { name: string; phone: string }
  ): Promise<ILead> {
    const normalizedPhone = normalizePhone(leadData.phone);
    const normalizedEmail = leadData.email ? normalizeEmail(leadData.email) : undefined;

    // Deduplication check
    const existing = await leadRepository.findDuplicate(
      organizationId,
      normalizedPhone,
      normalizedEmail
    );

    if (existing) {
      throw AppError.conflict(
        `A lead with phone (${leadData.phone}) or email (${leadData.email}) already exists in this workspace [${existing.leadId}]`
      );
    }

    const leadId = await leadRepository.generateLeadId(organizationId);
    const { score, scoreCategory } = this.calculateInitialScore({
      source: leadData.source || 'MANUAL',
      budget: leadData.budget,
      requirement: leadData.requirement,
    });

    // Auto-assignment if no owner provided
    let assignedTo = leadData.assignedTo;
    let ownerId = leadData.ownerId;
    let status = leadData.status || 'NEW';

    if (!ownerId) {
      const nextOwner = await this.getNextRoundRobinOwner(organizationId);
      if (nextOwner) {
        ownerId = nextOwner.id;
        assignedTo = nextOwner;
        status = 'ASSIGNED';
      }
    }

    const createdLead = await leadRepository.create(organizationId, {
      ...leadData,
      leadId,
      normalizedPhone,
      normalizedEmail,
      score,
      scoreCategory,
      status,
      ownerId,
      assignedTo,
      slaStatus: 'ON_TIME',
    });

    // Emit event for automation engine / notifications
    eventBus.emit('lead.created', {
      organizationId,
      leadId: createdLead.leadId,
      source: createdLead.source,
      score: createdLead.score,
      ownerId: createdLead.ownerId,
    });

    return createdLead;
  }

  /**
   * Query paginated leads with filters and search
   */
  async getLeads(
    organizationId: string,
    query: {
      page?: number;
      limit?: number;
      status?: string;
      ownerId?: string;
      source?: string;
      search?: string;
      scoreCategory?: LeadScoreCategory;
      slaStatus?: SlaStatus;
    }
  ) {
    const filter: Record<string, unknown> = {};

    if (query.status) filter.status = query.status;
    if (query.ownerId) filter.ownerId = query.ownerId;
    if (query.source) filter.source = query.source;
    if (query.scoreCategory) filter.scoreCategory = query.scoreCategory;
    if (query.slaStatus) filter.slaStatus = query.slaStatus;

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { company: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { leadId: searchRegex },
      ];
    }

    return leadRepository.findPaginated(organizationId, filter, {
      page: query.page,
      limit: query.limit,
      sort: { createdAt: -1 },
    });
  }

  /**
   * Get single lead by ID
   */
  async getLeadById(organizationId: string, id: string): Promise<ILead> {
    const lead = await leadRepository.findById(organizationId, id);
    if (!lead) {
      throw AppError.notFound('Lead');
    }
    return lead;
  }

  /**
   * Update lead fields with lifecycle event emission
   */
  async updateLead(organizationId: string, id: string, updateData: Partial<ILead>): Promise<ILead> {
    const existing = await leadRepository.findById(organizationId, id);
    if (!existing) {
      throw AppError.notFound('Lead');
    }

    if (updateData.phone) {
      updateData.normalizedPhone = normalizePhone(updateData.phone);
    }
    if (updateData.email) {
      updateData.normalizedEmail = normalizeEmail(updateData.email);
    }

    const updated = await leadRepository.updateById(organizationId, id, updateData);
    if (!updated) {
      throw AppError.notFound('Lead');
    }

    // If status changed, emit lifecycle event
    if (updateData.status && updateData.status !== existing.status) {
      eventBus.emit('lead.status_changed', {
        organizationId,
        leadId: updated.leadId,
        previousStatus: existing.status,
        newStatus: updateData.status,
      });
    }

    return updated;
  }

  /**
   * Delete lead by ID
   */
  async deleteLead(organizationId: string, id: string): Promise<void> {
    const deleted = await leadRepository.deleteById(organizationId, id);
    if (!deleted) {
      throw AppError.notFound('Lead');
    }
  }

  /**
   * Aggregate pipeline status metrics
   */
  async getMetrics(organizationId: string) {
    return leadRepository.getStatusMetrics(organizationId);
  }
}

export const leadService = new LeadService();
