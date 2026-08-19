import { useState } from 'react';
import { Lead } from '@/types';
import { DataTable, ColumnDef } from '@/components/patterns/DataTable';
import { KPICard } from '@/components/patterns/KPICard';
import { StatusPill } from '@/components/patterns/StatusPill';
import { LeadScoreBadge } from './components/LeadScoreBadge';
import { LeadDetailHeader } from './components/LeadDetailHeader';
import { LeadAISummaryCard } from './components/LeadAISummaryCard';
import { Timeline } from '@/components/patterns/Timeline';
import { SlideOverPanel } from '@/components/patterns/SlideOverPanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { PermissionGate } from '@/components/system/PermissionGate';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import { useUIStore } from '@/stores/uiStore';
import {
  UserPlus,
  Download,
  Users,
  Flame,
  DollarSign,
  Clock,
  Building2,
} from 'lucide-react';

import { useLeads } from './hooks/useLeads';
import { useActivities } from './hooks/useActivities';

export function LeadsPage() {
  const { leads, createLead, updateLead } = useLeads();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { activities } = useActivities(selectedLead?.id);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const { addToast } = useUIStore();

  // Form State
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadValue, setNewLeadValue] = useState('50000');

  const filteredLeads = leads.filter((l) => {
    if (statusFilter === 'ALL') return true;
    return l.status === statusFilter;
  });

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName || !newLeadCompany) return;

    await createLead({
      name: newLeadName,
      company: newLeadCompany,
      email: newLeadEmail || `${newLeadName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: newLeadPhone || '+1 (555) 019-2834',
      budget: Number(newLeadValue) || 50000,
      status: 'NEW',
    });

    setIsCreateModalOpen(false);
    setNewLeadName('');
    setNewLeadCompany('');
    setNewLeadEmail('');
    setNewLeadPhone('');
  };

  const columns: ColumnDef<Lead>[] = [
    {
      id: 'name',
      header: 'Contact & Title',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-fib-8">
          <Avatar name={row.name} size="sm" />
          <div className="min-w-0">
            <span className="font-bold text-neutral-900 block truncate group-hover:text-blue-600">
              {row.name}
            </span>
            <span className="text-[11px] text-neutral-500 block truncate">{row.title}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'company',
      header: 'Company',
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-fib-5 text-neutral-800 font-medium">
          <Building2 className="w-3.5 h-3.5 text-neutral-400" />
          <span>{row.company}</span>
        </div>
      ),
    },
    {
      id: 'score',
      header: 'AI Score',
      sortable: true,
      cell: ({ row }) => (
        <LeadScoreBadge score={row.score} category={row.scoreCategory} />
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      cell: ({ row }) => {
        const variantMap: Record<Lead['status'], any> = {
          NEW: 'info',
          CONTACTED: 'neutral',
          QUALIFIED: 'success',
          UNQUALIFIED: 'danger',
          NURTURING: 'warning',
          CONVERTED: 'success',
        };
        return <StatusPill label={row.status} variant={variantMap[row.status]} />;
      },
    },
    {
      id: 'estimatedValue',
      header: 'Est. Value',
      sortable: true,
      align: 'right',
      cell: ({ row }) => (
        <span className="font-bold text-neutral-900 tabular-nums">
          ${row.estimatedValue.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'assignedTo',
      header: 'Owner',
      cell: ({ row }) => (
        <div className="flex items-center gap-fib-5 text-neutral-700">
          <Avatar name={row.assignedTo.name} size="xs" />
          <span className="truncate">{row.assignedTo.name}</span>
        </div>
      ),
    },
    {
      id: 'lastContactedAt',
      header: 'Last Touch',
      cell: ({ row }) => (
        <span className="text-neutral-500 font-mono text-[11px]">
          {row.lastContactedAt || 'Never'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-fib-21">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-fib-13 pb-fib-8 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Leads & Prospects
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage incoming prospects, review AI intent scores, and drive high-conversion touches.
          </p>
        </div>

        <div className="flex items-center gap-fib-8">
          <PermissionGate permission="lead.export">
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() =>
                addToast({
                  type: 'info',
                  title: 'Exporting Leads',
                  message: 'Generated CSV export for 5 lead records.',
                })
              }
            >
              Export
            </Button>
          </PermissionGate>

          <PermissionGate permission="lead.create">
            <Button
              variant="primary"
              size="sm"
              icon={<UserPlus className="w-3.5 h-3.5" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Add Lead
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* KPI Tiles Row (Fibonacci 4-col proportions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fib-13">
        <WidgetBoundary name="kpi-total-leads">
          <KPICard
            label="Total Active Leads"
            value={leads.length}
            delta="+18%"
            deltaDirection="up"
            deltaLabel="vs. last week"
            accent="blue"
            icon={<Users className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-hot-prospects">
          <KPICard
            label="Hot Buying Signals"
            value={leads.filter((l) => l.scoreCategory === 'HOT').length}
            delta="+25%"
            deltaDirection="up"
            deltaLabel="AI qualified"
            accent="rose"
            icon={<Flame className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-pipeline-value">
          <KPICard
            label="Total Pipeline Value"
            value={`$${leads.reduce((s, l) => s + l.estimatedValue, 0).toLocaleString()}`}
            delta="+$45k"
            deltaDirection="up"
            deltaLabel="weighted forecast"
            accent="green"
            icon={<DollarSign className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-sla-time">
          <KPICard
            label="Avg First Touch SLA"
            value="4.2m"
            delta="-32%"
            deltaDirection="up"
            deltaLabel="faster response"
            accent="neutral"
            icon={<Clock className="w-4 h-4" />}
          />
        </WidgetBoundary>
      </div>

      {/* Data Table with Fault Isolation */}
      <WidgetBoundary name="leads-data-table">
        <DataTable
          columns={columns}
          data={filteredLeads}
          keyExtractor={(lead) => lead.id}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={(lead) => setSelectedLead(lead)}
          searchPlaceholder="Search by name, company, email, or title..."
          filterComponent={
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="skeuo-sunken text-xs font-semibold px-fib-8 py-fib-8 rounded-md bg-white border border-neutral-300 text-neutral-700 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="NURTURING">Nurturing</option>
            </select>
          }
          bulkActions={
            <button
              onClick={() => {
                addToast({
                  type: 'success',
                  title: 'Bulk Reassigned',
                  message: `Assigned ${selectedIds.length} leads to Devon Patel`,
                });
                setSelectedIds([]);
              }}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 underline"
            >
              Reassign Owner
            </button>
          }
        />
      </WidgetBoundary>

      {/* SlideOver Lead Detail View Drawer */}
      <SlideOverPanel
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        title={selectedLead?.name}
        subtitle={`${selectedLead?.title} at ${selectedLead?.company}`}
        width="xl"
      >
        {selectedLead && (
          <div className="space-y-fib-21">
            <LeadDetailHeader lead={selectedLead} />

            {/* AI Assistant Section (Independent WidgetBoundary) */}
            <LeadAISummaryCard
              lead={selectedLead}
              onUpdateLead={async (updated) => {
                await updateLead({
                  id: updated.id,
                  payload: { aiSummary: updated.aiSummary, score: updated.score },
                });
                setSelectedLead(updated);
              }}
            />

            {/* Activity Timeline (Independent WidgetBoundary) */}
            <WidgetBoundary name={`lead-timeline-${selectedLead.id}`}>
              <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 p-fib-21 space-y-fib-13">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Activity Feed & Engagement History
                </h3>
                <Timeline events={activities} />
              </div>
            </WidgetBoundary>
          </div>
        )}
      </SlideOverPanel>

      {/* Create Lead Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-fib-13">
          <div
            onClick={() => setIsCreateModalOpen(false)}
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in"
          />
          <div className="relative w-full max-w-lg skeuo-raised-3 bg-white rounded-xl border border-neutral-200 p-fib-21 z-10 shadow-2xl space-y-fib-21">
            <div className="border-b border-neutral-100 pb-fib-8">
              <h3 className="text-base font-bold text-neutral-900">Add New Inbound Lead</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Record new prospect details. AI intent scoring will run automatically upon creation.
              </p>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-fib-13">
              <Input
                label="Full Name *"
                placeholder="e.g. Rachel Adams"
                value={newLeadName}
                onChange={(e) => setNewLeadName(e.target.value)}
                required
              />

              <Input
                label="Company Name *"
                placeholder="e.g. Apex Global Systems"
                value={newLeadCompany}
                onChange={(e) => setNewLeadCompany(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-fib-13">
                <Input
                  label="Work Email"
                  type="email"
                  placeholder="rachel@apex.com"
                  value={newLeadEmail}
                  onChange={(e) => setNewLeadEmail(e.target.value)}
                />
                <Input
                  label="Phone Number"
                  placeholder="+1 (555) 234-5678"
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                />
              </div>

              <Input
                label="Estimated Deal Value ($)"
                type="number"
                value={newLeadValue}
                onChange={(e) => setNewLeadValue(e.target.value)}
              />

              <div className="pt-fib-13 border-t border-neutral-100 flex items-center justify-end gap-fib-8">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create Lead
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
