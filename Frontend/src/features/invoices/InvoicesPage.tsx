import { useState } from 'react';
import { Invoice } from '@/types';
import { DataTable, ColumnDef } from '@/components/patterns/DataTable';
import { KPICard } from '@/components/patterns/KPICard';
import { StatusPill } from '@/components/patterns/StatusPill';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SlideOverPanel } from '@/components/patterns/SlideOverPanel';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import { PermissionGate } from '@/components/system/PermissionGate';
import { useInvoices } from './hooks/useInvoices';
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Plus,
  Building2,
  Calendar,
  DollarSign,
  Receipt,
} from 'lucide-react';

export function InvoicesPage() {
  const { invoices, createInvoice, recordPayment, isCreating, isRecordingPayment } = useInvoices();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [newAmount, setNewAmount] = useState('35000');
  const [newDueDate, setNewDueDate] = useState('2026-09-30');

  const handleMarkAsPaid = async (inv: Invoice) => {
    await recordPayment({ id: inv.id });
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newAmount) return;

    await createInvoice({
      company: newCompany,
      recipientName: newCompany,
      recipientEmail: newRecipientEmail || `billing@${newCompany.toLowerCase().replace(/\s+/g, '')}.com`,
      amount: Number(newAmount) || 25000,
      currency: 'USD',
      dueDate: newDueDate,
      lineItems: [
        {
          description: 'ADVMEN Enterprise Platform License & Onboarding',
          quantity: 1,
          unitPrice: Number(newAmount) || 25000,
          total: Number(newAmount) || 25000,
        },
      ],
    });

    setIsCreateModalOpen(false);
    setNewCompany('');
    setNewRecipientEmail('');
  };

  const columns: ColumnDef<Invoice>[] = [
    {
      id: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      cell: ({ row }) => (
        <span className="font-mono font-bold text-neutral-900 text-xs">
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      id: 'company',
      header: 'Company / Client',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-fib-5 font-medium text-neutral-800">
          <Building2 className="w-3.5 h-3.5 text-neutral-400" />
          <span>{row.company}</span>
        </div>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      sortable: true,
      align: 'right',
      cell: ({ row }) => (
        <span className="font-bold text-neutral-900 tabular-nums">
          ${row.amount.toLocaleString()} {row.currency}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      cell: ({ row }) => {
        const variantMap: Record<Invoice['status'], any> = {
          DRAFT: 'neutral',
          SENT: 'info',
          PAID: 'success',
          OVERDUE: 'danger',
          VOID: 'neutral',
        };
        return <StatusPill label={row.status} variant={variantMap[row.status]} />;
      },
    },
    {
      id: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <span className="font-mono text-neutral-600 text-[11px]">{row.dueDate}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => {
        if (row.status === 'PAID') {
          return (
            <span className="text-[11px] text-green-700 font-semibold font-mono">
              ✓ Paid on {row.paidAt || 'Recent'}
            </span>
          );
        }
        return (
          <PermissionGate permission="invoice.manage">
            <Button
              size="xs"
              variant="secondary"
              isLoading={isRecordingPayment}
              onClick={() => handleMarkAsPaid(row)}
            >
              Record Payment
            </Button>
          </PermissionGate>
        );
      },
    },
  ];

  const totalCollected = invoices
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + i.amount, 0);

  const pendingCollection = invoices
    .filter((i) => i.status === 'SENT' || i.status === 'OVERDUE')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-fib-21">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-fib-13 pb-fib-8 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Invoices & Payment Collection
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Automated billing, reconciliation, and payment status verification.
          </p>
        </div>

        <PermissionGate permission="invoice.create">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Invoice
          </Button>
        </PermissionGate>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fib-13">
        <WidgetBoundary name="kpi-total-collected">
          <KPICard
            label="Total Revenue Collected"
            value={`$${totalCollected.toLocaleString()}`}
            delta="+$240k"
            deltaDirection="up"
            deltaLabel="settled"
            accent="green"
            icon={<CheckCircle className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-pending-collection">
          <KPICard
            label="Outstanding Receivables"
            value={`$${pendingCollection.toLocaleString()}`}
            delta="due in 30 days"
            deltaDirection="flat"
            deltaLabel="projected"
            accent="blue"
            icon={<CreditCard className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-overdue-invoices">
          <KPICard
            label="Overdue Invoices"
            value={invoices.filter((i) => i.status === 'OVERDUE').length}
            delta="Urgent collection"
            deltaDirection="down"
            deltaLabel="action needed"
            accent="rose"
            icon={<AlertCircle className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-collection-days">
          <KPICard
            label="DSO (Days Sales Outstanding)"
            value="18 Days"
            delta="-4 days"
            deltaDirection="up"
            deltaLabel="faster payment"
            accent="neutral"
            icon={<Calendar className="w-4 h-4" />}
          />
        </WidgetBoundary>
      </div>

      {/* Table */}
      <WidgetBoundary name="invoices-data-table">
        <DataTable
          columns={columns}
          data={invoices}
          keyExtractor={(inv) => inv.id}
          searchPlaceholder="Search invoices by number or company..."
        />
      </WidgetBoundary>

      {/* Create Invoice SlideOver */}
      <SlideOverPanel
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate New Client Invoice"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-fib-13 p-fib-13">
          <Input
            label="Client / Company Name"
            placeholder="Acme Enterprise Inc."
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            required
          />
          <Input
            label="Billing Email"
            type="email"
            placeholder="billing@acmecorp.com"
            value={newRecipientEmail}
            onChange={(e) => setNewRecipientEmail(e.target.value)}
          />
          <Input
            label="Invoice Amount (USD)"
            type="number"
            placeholder="50000"
            leftIcon={<DollarSign className="w-4 h-4" />}
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            required
          />
          <Input
            label="Due Date"
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            required
          />

          <div className="pt-fib-13 flex justify-end gap-fib-8">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreating}
              icon={<Receipt className="w-4 h-4" />}
            >
              Issue Invoice
            </Button>
          </div>
        </form>
      </SlideOverPanel>
    </div>
  );
}
