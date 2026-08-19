import { Router } from 'express';
import { leadController } from './lead.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { tenantMiddleware } from '../../middleware/tenant.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { CreateLeadSchema, UpdateLeadSchema, LeadFilterQuerySchema } from './lead.validators.js';
import { PERMISSION_KEYS } from '../../config/constants.js';

export const leadRouter = Router();

// Apply auth and tenant middlewares to all lead routes
leadRouter.use(authMiddleware, tenantMiddleware);

leadRouter.post(
  '/',
  requirePermission(PERMISSION_KEYS.LEAD_CREATE),
  validateRequest({ body: CreateLeadSchema }),
  leadController.createLead
);

leadRouter.get(
  '/',
  requirePermission(PERMISSION_KEYS.LEAD_VIEW),
  validateRequest({ query: LeadFilterQuerySchema }),
  leadController.getLeads
);

leadRouter.get(
  '/metrics',
  requirePermission(PERMISSION_KEYS.LEAD_VIEW),
  leadController.getMetrics
);

leadRouter.get(
  '/:id',
  requirePermission(PERMISSION_KEYS.LEAD_VIEW),
  leadController.getLeadById
);

leadRouter.patch(
  '/:id',
  requirePermission(PERMISSION_KEYS.LEAD_EDIT),
  validateRequest({ body: UpdateLeadSchema }),
  leadController.updateLead
);

leadRouter.delete(
  '/:id',
  requirePermission(PERMISSION_KEYS.LEAD_DELETE),
  leadController.deleteLead
);
