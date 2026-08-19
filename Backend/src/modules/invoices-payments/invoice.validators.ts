import { z } from 'zod';

export const CreateInvoiceSchema = z.object({
  proposalId: z.string().optional(),
  dealId: z.string().optional(),
  company: z.string().min(2, 'Company name is required'),
  recipientEmail: z.string().email('Valid recipient email is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().optional().default('USD'),
  dueDate: z.string().datetime(),
});

export const RecordPaymentSchema = z.object({
  paymentId: z.string().min(1, 'Payment transaction ID is required'),
  paymentProvider: z.string().optional().default('stripe'),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
});

export const InvoiceFilterQuerySchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 25)),
  status: z.string().optional(),
  search: z.string().optional(),
});
