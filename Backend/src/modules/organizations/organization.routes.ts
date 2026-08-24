import { Router } from 'express';
import { organizationController } from './organization.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { CreateOrganizationSchema } from './organization.validators.js';

export const organizationRouter = Router();

organizationRouter.use(authMiddleware);

organizationRouter.get('/', organizationController.getOrganizations);
organizationRouter.get('/:id', organizationController.getOrganizationById);
organizationRouter.post(
  '/',
  validateRequest({ body: CreateOrganizationSchema }),
  organizationController.createOrganization
);
