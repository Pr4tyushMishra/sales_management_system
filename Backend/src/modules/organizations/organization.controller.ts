import { Request, Response } from 'express';
import { organizationService } from './organization.service.js';
import { ApiResponse } from '../../shared/response/ApiResponse.js';
import { AuthenticatedUser } from '../../middleware/auth.middleware.js';

export class OrganizationController {
  async getOrganizations(req: Request, res: Response): Promise<void> {
    const requester = req.user as AuthenticatedUser;
    const orgs = await organizationService.getOrganizations(requester);

    ApiResponse.success(res, orgs, 200, undefined, 'Tenant organizations retrieved successfully');
  }

  async getOrganizationById(req: Request, res: Response): Promise<void> {
    const requester = req.user as AuthenticatedUser;
    const org = await organizationService.getOrganizationById(requester, req.params.id);

    ApiResponse.success(res, org, 200, undefined, 'Organization details');
  }

  async createOrganization(req: Request, res: Response): Promise<void> {
    const requester = req.user as AuthenticatedUser;
    const org = await organizationService.createOrganization(requester, req.body);

    ApiResponse.created(res, org, `Tenant organization '${org.name}' created successfully`);
  }
}

export const organizationController = new OrganizationController();
