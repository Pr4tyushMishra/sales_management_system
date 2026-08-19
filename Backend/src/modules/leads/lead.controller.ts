import { Request, Response } from 'express';
import { leadService } from './lead.service.js';
import { ApiResponse } from '../../shared/response/ApiResponse.js';

export class LeadController {
  async createLead(req: Request, res: Response): Promise<void> {
    const organizationId = req.organizationId!;
    const lead = await leadService.createLead(organizationId, req.body);
    ApiResponse.created(res, lead, 'Lead captured successfully');
  }

  async getLeads(req: Request, res: Response): Promise<void> {
    const organizationId = req.organizationId!;
    const result = await leadService.getLeads(organizationId, req.query as never);
    ApiResponse.paginated(
      res,
      result.docs,
      result.total,
      result.page,
      result.limit,
      'Leads retrieved successfully'
    );
  }

  async getLeadById(req: Request, res: Response): Promise<void> {
    const organizationId = req.organizationId!;
    const lead = await leadService.getLeadById(organizationId, req.params.id);
    ApiResponse.success(res, lead, 200, undefined, 'Lead details retrieved');
  }

  async updateLead(req: Request, res: Response): Promise<void> {
    const organizationId = req.organizationId!;
    const updated = await leadService.updateLead(organizationId, req.params.id, req.body);
    ApiResponse.success(res, updated, 200, undefined, 'Lead updated successfully');
  }

  async deleteLead(req: Request, res: Response): Promise<void> {
    const organizationId = req.organizationId!;
    await leadService.deleteLead(organizationId, req.params.id);
    ApiResponse.success(res, { deleted: true }, 200, undefined, 'Lead deleted successfully');
  }

  async getMetrics(req: Request, res: Response): Promise<void> {
    const organizationId = req.organizationId!;
    const metrics = await leadService.getMetrics(organizationId);
    ApiResponse.success(res, metrics, 200, undefined, 'Lead status metrics retrieved');
  }
}

export const leadController = new LeadController();
