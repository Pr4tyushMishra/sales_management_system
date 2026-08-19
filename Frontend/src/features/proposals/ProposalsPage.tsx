import { useState } from 'react';
import { Proposal } from '@/types';
import { DataTable, ColumnDef } from '@/components/patterns/DataTable';
import { KPICard } from '@/components/patterns/KPICard';
import { StatusPill } from '@/components/patterns/StatusPill';
import { SlideOverPanel } from '@/components/patterns/SlideOverPanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import { PermissionGate } from '@/components/system/PermissionGate';
import { useProposals } from './hooks/useProposals';
import {
  FileText,
  DollarSign,
  Send,
  CheckCircle,
  Plus,
  Building2,
  Sparkles,
} from 'lucide-react';

export function ProposalsPage() {
  const { proposals, createProposal, updateStatus, isCreating } = useProposals();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [newAmount, setNewAmount] = useState('75000');

  const handleSendProposal = async (prop: Proposal) => {
    await updateStatus({ id: prop.id, status: 'SENT' });
    if (selectedProposal && selectedProposal.id === prop.id) {
      setSelectedProposal({ ...selectedProposal, status: 'SENT' });
    }
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newAmount) return;

    await createProposal({
      dealTitle: newTitle || `${newCompany} Expansion Contract`,
      company: newCompany,
      recipientName: newRecipientName || 'Decision Maker',
      recipientEmail: newRecipientEmail || `procurement@${newCompany.toLowerCase().replace(/\s+/g, '')}.com`,
      amount: Number(newAmount) || 75000,
      validUntil: '2026-10-31',
    });

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewCompany('');
    setNewRecipientName('');
    setNewRecipientEmail('');
  };

  const columns: ColumnDef<Proposal>[] = [
    {
      id: 'proposalNumber',
      header: 'Proposal #',
      sortable: true,
      cell: ({ row }) => (
        <span className="font-mono font-bold text-neutral-900 text-xs">
          {row.proposalNumber}
        </span>
      ),
    },
    {
      id: 'dealTitle',
      header: 'Opportunity & Company',
      cell: ({ row }) => (
        <div>
          <span className="font-bold text-neutral-900 block">{row.dealTitle}</span>
          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
            <Building2 className="w-3 h-3 text-neutral-400" />
            <span>{row.company}</span>
          </div>
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
          ${row.amount.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      cell: ({ row }) => {
        const variantMap: Record<Proposal['status'], any> = {
          DRAFT: 'neutral',
          SENT: 'info',
          VIEWED: 'warning',
          ACCEPTED: 'success',
          DECLINED: 'danger',
        };
        return <StatusPill label={row.status} variant={variantMap[row.status]} />;
      },
    },
    {
      id: 'validUntil',
      header: 'Valid Until',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-neutral-500">{row.validUntil}</span>
      ),
    },
  ];

  return (
    <div className="space-y-fib-21">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-fib-13 pb-fib-8 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Proposals & Quotes
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure line items, generate PDF contracts, and track prospect engagement.
          </p>
        </div>

        <PermissionGate permission="proposal.create">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Proposal
          </Button>
        </PermissionGate>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fib-13">
        <WidgetBoundary name="kpi-proposals-active">
          <KPICard
            label="Total Proposals Active"
            value={proposals.length}
            subtext="In negotiation"
            accent="blue"
            icon={<FileText className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-proposals-value">
          <KPICard
            label="Proposal Pipeline Value"
            value={`$${proposals.reduce((s, p) => s + p.amount, 0).toLocaleString()}`}
            delta="+$65k"
            deltaDirection="up"
            deltaLabel="pipeline"
            accent="green"
            icon={<DollarSign className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-acceptance-rate">
          <KPICard
            label="Acceptance Rate"
            value="82%"
            delta="+8%"
            deltaDirection="up"
            deltaLabel="vs. target"
            accent="green"
            icon={<CheckCircle className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-ai-quote-speed">
          <KPICard
            label="Avg Generation Time"
            value="1.8m"
            delta="AI auto-fill"
            deltaDirection="up"
            deltaLabel="instant CPQ"
            accent="violet"
            icon={<Sparkles className="w-4 h-4" />}
          />
        </WidgetBoundary>
      </div>

      {/* Table */}
      <WidgetBoundary name="proposals-data-table">
        <DataTable
          columns={columns}
          data={proposals}
          keyExtractor={(p) => p.id}
          onRowClick={(p) => setSelectedProposal(p)}
          searchPlaceholder="Search proposals by number, company, or deal..."
        />
      </WidgetBoundary>

      {/* Create Proposal SlideOver */}
      <SlideOverPanel
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Client Proposal"
      >
        <form onSubmit={handleCreateProposal} className="space-y-fib-13 p-fib-13">
          <Input
            label="Contract / Deal Title"
            placeholder="Enterprise Platform & SLA Bundle"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Input
            label="Client Company Name"
            placeholder="Acme Logistics Global"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            required
          />
          <Input
            label="Recipient Name"
            placeholder="Sarah Jenkins"
            value={newRecipientName}
            onChange={(e) => setNewRecipientName(e.target.value)}
          />
          <Input
            label="Recipient Email"
            type="email"
            placeholder="s.jenkins@acme.com"
            value={newRecipientEmail}
            onChange={(e) => setNewRecipientEmail(e.target.value)}
          />
          <Input
            label="Proposed Amount (USD)"
            type="number"
            leftIcon={<DollarSign className="w-4 h-4" />}
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
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
              icon={<Plus className="w-4 h-4" />}
            >
              Save Draft Proposal
            </Button>
          </div>
        </form>
      </SlideOverPanel>

      {/* SlideOver Drawer for Proposal Preview */}
      <SlideOverPanel
        isOpen={!!selectedProposal}
        onClose={() => setSelectedProposal(null)}
        title={selectedProposal?.proposalNumber}
        subtitle={`${selectedProposal?.company} • ${selectedProposal?.dealTitle}`}
      >
        {selectedProposal && (
          <div className="space-y-fib-21 p-fib-13">
            {/* Header overview */}
            <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 p-fib-21 flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider block">
                  Total Contract Value
                </span>
                <span className="text-3xl font-extrabold text-neutral-900 tabular-nums">
                  ${selectedProposal.amount.toLocaleString()}
                </span>
              </div>
              <Button
                variant={selectedProposal.status === 'SENT' ? 'secondary' : 'primary'}
                size="sm"
                icon={<Send className="w-3.5 h-3.5" />}
                onClick={() => handleSendProposal(selectedProposal)}
              >
                {selectedProposal.status === 'SENT' ? 'Resend to Client' : 'Send Proposal'}
              </Button>
            </div>

            {/* Document Preview Details */}
            <div className="skeuo-raised-1 bg-white rounded-md border border-neutral-200 p-fib-21 space-y-fib-13 text-xs">
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] border-b border-neutral-100 pb-fib-8">
                Line Items & Licensing Terms
              </h4>
              <div className="space-y-fib-8 divide-y divide-neutral-100">
                <div className="flex items-center justify-between pt-fib-8">
                  <div>
                    <span className="font-bold text-neutral-900 block">ADVMEN SalesOS Enterprise Tier</span>
                    <span className="text-neutral-500 text-[11px]">50 Rep Seats • High Volume Voice & WhatsApp</span>
                  </div>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    ${(selectedProposal.amount * 0.8).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-fib-8">
                  <div>
                    <span className="font-bold text-neutral-900 block">Dedicated RevOps SLA & Private VPC</span>
                    <span className="text-neutral-500 text-[11px]">99.99% Uptime SLA • 15m Emergency Bridge</span>
                  </div>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    ${(selectedProposal.amount * 0.2).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </SlideOverPanel>
    </div>
  );
}
