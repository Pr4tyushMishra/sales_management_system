import { proposalRepository } from './proposal.repository.js';
import { IProposal, ProposalStatus } from './proposal.model.js';
import { AppError } from '../../shared/errors/AppError.js';

export class ProposalService {
  async createProposal(organizationId: string, data: Partial<IProposal>): Promise<IProposal> {
    const { proposalId, proposalNumber } = await proposalRepository.generateProposalNumber(organizationId);

    const items = data.items || [];
    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const discount = data.discount || 0;
    const taxRate = data.taxRate || 0;
    const taxAmount = (subtotal - discount) * (taxRate / 100);
    const amount = Math.max(0, subtotal - discount + taxAmount);

    const proposal = await proposalRepository.create(organizationId, {
      ...data,
      proposalId,
      proposalNumber,
      subtotal,
      discount,
      taxRate,
      amount,
      status: 'DRAFT',
    });

    return proposal;
  }

  async getProposals(organizationId: string, query: { page?: number; limit?: number; status?: string; dealId?: string }) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.dealId) filter.dealId = query.dealId;

    return proposalRepository.findPaginated(organizationId, filter, {
      page: query.page,
      limit: query.limit,
      sort: { createdAt: -1 },
    });
  }

  async getProposalById(organizationId: string, id: string): Promise<IProposal> {
    const proposal = await proposalRepository.findById(organizationId, id);
    if (!proposal) {
      throw AppError.notFound('Proposal');
    }
    return proposal;
  }

  async updateProposalStatus(organizationId: string, id: string, status: ProposalStatus): Promise<IProposal> {
    const updateData: Partial<IProposal> = { status };
    if (status === 'VIEWED') updateData.viewedAt = new Date();
    if (status === 'ACCEPTED') updateData.acceptedAt = new Date();
    if (status === 'DECLINED') updateData.declinedAt = new Date();

    const updated = await proposalRepository.updateById(organizationId, id, updateData);
    if (!updated) {
      throw AppError.notFound('Proposal');
    }

    if (status === 'SENT' && updated.recipientEmail) {
      import('../../shared/services/email.service.js').then(({ emailService }) => {
        emailService.sendProposalEmail(updated.recipientEmail, updated.proposalNumber, (updated as any).company || 'Client', updated.amount);
      }).catch(() => {});
    }

    return updated;
  }
}

export const proposalService = new ProposalService();
