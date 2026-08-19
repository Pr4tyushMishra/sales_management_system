import { z } from 'zod';

export const CreateProposalSchema = z.object({
  dealId: z.string().optional(),
  dealTitle: z.string().optional(),
  company: z.string().min(2, 'Company name is required'),
  recipientName: z.string().min(2, 'Recipient name is required'),
  recipientEmail: z.string().email('Valid recipient email is required'),
  items: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
        total: z.number().nonnegative(),
      })
    )
    .min(1, 'At least one item is required'),
  taxRate: z.number().min(0).optional().default(0),
  discount: z.number().min(0).optional().default(0),
  currency: z.string().optional().default('USD'),
  validUntil: z.string().datetime(),
});

export const UpdateProposalStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'DECLINED']),
});
