import { z } from 'zod';

export const CreateDealSchema = z.object({
  title: z.string().min(2, 'Deal title is required'),
  company: z.string().min(2, 'Company name is required'),
  contactName: z.string().min(2, 'Contact name is required'),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  value: z.number().positive('Value must be greater than 0'),
  currency: z.string().optional().default('USD'),
  stage: z
    .enum(['DISCOVERY', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'])
    .optional()
    .default('DISCOVERY'),
  pipelineId: z.string().optional().default('pipe_default'),
  probability: z.number().min(0).max(100).optional().default(10),
  expectedCloseDate: z.string().datetime(),
  ownerId: z.string().optional(),
  leadId: z.string().optional(),
  customFields: z.record(z.unknown()).optional().default({}),
});

export const UpdateDealSchema = CreateDealSchema.partial().extend({
  reason: z.string().optional(),
  competitorLostTo: z.string().optional(),
});

export const DealFilterQuerySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 50)),
  stage: z.string().optional(),
  pipelineId: z.string().optional(),
  ownerId: z.string().optional(),
  search: z.string().optional(),
});
