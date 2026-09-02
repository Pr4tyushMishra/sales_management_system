import { useState } from 'react';
import { Deal, DealStage } from '@/types';
import { KanbanBoard, KanbanColumn } from '@/components/patterns/KanbanBoard';
import { KPICard } from '@/components/patterns/KPICard';
import { SlideOverPanel } from '@/components/patterns/SlideOverPanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StatusPill } from '@/components/patterns/StatusPill';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import { PermissionGate } from '@/components/system/PermissionGate';
import {
  Plus,
  DollarSign,
  TrendingUp,
  Award,
  AlertCircle,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

import { useDeals } from './hooks/useDeals';

export function DealsPage() {
  const { deals, createDeal, moveStage, deleteDeal, isDeleting, isCreating } = useDeals();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);

  // Form State
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealCompany, setNewDealCompany] = useState('');
  const [newDealContact, setNewDealContact] = useState('');
  const [newDealValue, setNewDealValue] = useState('75000');
  const [newDealStage, setNewDealStage] = useState<DealStage>('DISCOVERY');
  const [newDealCloseDate, setNewDealCloseDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  const stages: KanbanColumn[] = [
    { id: 'DISCOVERY', label: 'Discovery', accent: 'neutral' },
    { id: 'QUALIFICATION', label: 'Qualification', accent: 'amber' },
    { id: 'PROPOSAL', label: 'Proposal', accent: 'blue' },
    { id: 'NEGOTIATION', label: 'Negotiation', accent: 'amber' },
    { id: 'WON', label: 'Won', accent: 'green' },
    { id: 'LOST', label: 'Lost', accent: 'rose' },
  ];

  const handleMoveStage = (dealId: string, newStage: DealStage) => {
    moveStage(dealId, newStage);
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealTitle.trim() || !newDealCompany.trim()) return;

    await createDeal({
      title: newDealTitle.trim(),
      company: newDealCompany.trim(),
      contactName: newDealContact.trim() || 'Key Contact',
      value: Number(newDealValue) || 75000,
      stage: newDealStage,
      probability: newDealStage === 'WON' ? 100 : 50,
      expectedCloseDate: newDealCloseDate || new Date(Date.now() + 30 * 86400000).toISOString(),
    });

    setIsNewDealOpen(false);
    setNewDealTitle('');
    setNewDealCompany('');
    setNewDealContact('');
  };

  const totalPipelineValue = deals
    .filter((d) => d.stage !== 'LOST')
    .reduce((sum, d) => sum + d.value, 0);

  const wonRevenue = deals
    .filter((d) => d.stage === 'WON')
    .reduce((sum, d) => sum + d.value, 0);

  const winRate = Math.round(
    (deals.filter((d) => d.stage === 'WON').length / (deals.length || 1)) * 100
  );

  return (
    <div className="space-y-fib-21">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-fib-13 pb-fib-8 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Deals & Pipeline Kanban
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time multi-stage visual pipeline with win forecasting and SLA tracking.
          </p>
        </div>

        <PermissionGate permission="deal.create">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsNewDealOpen(true)}
          >
            New Opportunity
          </Button>
        </PermissionGate>
      </div>

      {/* KPI Tiles Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fib-13">
        <WidgetBoundary name="kpi-pipeline-active">
          <KPICard
            label="Active Pipeline Value"
            value={`$${totalPipelineValue.toLocaleString()}`}
            subtext={`${deals.length} Active Deals`}
            accent="blue"
            icon={<DollarSign className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-won-revenue">
          <KPICard
            label="Closed Won Revenue"
            value={`$${wonRevenue.toLocaleString()}`}
            subtext={`${deals.filter((d) => d.stage === 'WON').length} Closed Won`}
            accent="green"
            icon={<Award className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-win-rate">
          <KPICard
            label="Forecast Win Rate"
            value={`${winRate}%`}
            subtext="Won vs total pipeline"
            accent="green"
            icon={<TrendingUp className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-at-risk-deals">
          <KPICard
            label="At-Risk Deals"
            value={deals.filter((d) => d.health === 'AT_RISK').length}
            subtext={deals.filter((d) => d.health === 'AT_RISK').length ? 'Requires attention' : 'All deals healthy'}
            accent={deals.filter((d) => d.health === 'AT_RISK').length ? 'rose' : 'green'}
            icon={<AlertCircle className="w-4 h-4" />}
          />
        </WidgetBoundary>
      </div>

      {/* Pipeline Board */}
      <WidgetBoundary name="pipeline-kanban-board">
        <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 p-fib-13">
          <KanbanBoard
            stages={stages}
            deals={deals}
            onDealClick={(deal) => setSelectedDeal(deal)}
            onMoveDealStage={handleMoveStage}
            onDeleteDeal={(deal) => setDealToDelete(deal)}
          />
        </div>
      </WidgetBoundary>

      {/* Deal Detail Slide-Over Drawer */}
      <SlideOverPanel
        isOpen={!!selectedDeal}
        onClose={() => setSelectedDeal(null)}
        title={selectedDeal?.title}
        subtitle={`${selectedDeal?.company} • Expected close ${selectedDeal?.expectedCloseDate}`}
        badge={
          selectedDeal && (
            <StatusPill
              label={selectedDeal.stage}
              variant={
                selectedDeal.stage === 'WON'
                  ? 'success'
                  : selectedDeal.stage === 'LOST'
                  ? 'danger'
                  : 'info'
              }
            />
          )
        }
      >
        {selectedDeal && (
          <div className="space-y-fib-21">
            {/* Value Hero Card */}
            <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 p-fib-21 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                  Contract Value
                </span>
                <span className="text-3xl font-extrabold text-neutral-900 tabular-nums">
                  ${selectedDeal.value.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                  Win Probability
                </span>
                <span className="text-2xl font-bold text-green-700 tabular-nums">
                  {selectedDeal.probability}%
                </span>
              </div>
            </div>

            {/* Meta Information */}
            <div className="skeuo-raised-1 bg-white rounded-md border border-neutral-200 p-fib-13 space-y-fib-8 text-xs">
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
                Deal Characteristics
              </h4>
              <div className="grid grid-cols-2 gap-fib-13 text-neutral-700">
                <div className="flex items-center gap-fib-5">
                  <Building2 className="w-4 h-4 text-neutral-400" />
                  <span>Company: {selectedDeal.company}</span>
                </div>
                <div className="flex items-center gap-fib-5">
                  <User className="w-4 h-4 text-neutral-400" />
                  <span>Primary Contact: {selectedDeal.contactName}</span>
                </div>
                <div className="flex items-center gap-fib-5">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span>Target Close: {selectedDeal.expectedCloseDate}</span>
                </div>
                <div className="flex items-center gap-fib-5">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <span>Health: {selectedDeal.health}</span>
                </div>
              </div>
            </div>

            {/* Quick Stage Progression */}
            <div className="skeuo-raised-1 bg-white rounded-md border border-neutral-200 p-fib-13 space-y-fib-8">
              <h4 className="text-xs font-bold text-neutral-900">Change Pipeline Stage</h4>
              <div className="flex flex-wrap gap-fib-8">
                {stages.map((stg) => (
                  <Button
                    key={stg.id}
                    size="xs"
                    variant={selectedDeal.stage === stg.id ? 'primary' : 'secondary'}
                    onClick={() => {
                      handleMoveStage(selectedDeal.id, stg.id);
                      setSelectedDeal({ ...selectedDeal, stage: stg.id });
                    }}
                  >
                    {stg.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Delete Deal Option */}
            <div className="pt-fib-13 border-t border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-800 block">Delete Opportunity</span>
                <span className="text-[11px] text-neutral-500">Permanently remove from sales pipeline</span>
              </div>
              <Button
                size="xs"
                variant="danger"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => setDealToDelete(selectedDeal)}
              >
                Delete Deal
              </Button>
            </div>
          </div>
        )}
      </SlideOverPanel>

      {/* New Opportunity Modal */}
      {isNewDealOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-fib-13">
          <div
            onClick={() => setIsNewDealOpen(false)}
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in"
          />
          <div className="relative w-full max-w-lg skeuo-raised-3 bg-white rounded-xl border border-neutral-200 p-fib-21 z-10 shadow-2xl space-y-fib-21">
            <div className="border-b border-neutral-100 pb-fib-8">
              <h3 className="text-base font-bold text-neutral-900">Create New Opportunity</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Register deal into the visual pipeline and assign revenue forecasts.
              </p>
            </div>

            <form onSubmit={handleCreateDeal} className="space-y-fib-13">
              <Input
                label="Opportunity Name *"
                placeholder="e.g. Enterprise License Expansion"
                value={newDealTitle}
                onChange={(e) => setNewDealTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-fib-13">
                <Input
                  label="Company Name *"
                  placeholder="e.g. Global Tech Inc."
                  value={newDealCompany}
                  onChange={(e) => setNewDealCompany(e.target.value)}
                  required
                />
                <Input
                  label="Primary Contact"
                  placeholder="e.g. John Doe"
                  value={newDealContact}
                  onChange={(e) => setNewDealContact(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-fib-13 items-start">
                <Input
                  label="Deal Value ($)"
                  type="number"
                  value={newDealValue}
                  onChange={(e) => setNewDealValue(e.target.value)}
                />
                <Select
                  label="Initial Stage"
                  value={newDealStage}
                  onChange={(val) => setNewDealStage(val as DealStage)}
                  options={stages.map((s) => ({
                    value: s.id,
                    label: s.label,
                    description: `Column: ${s.label}`,
                  }))}
                />
              </div>

              <Input
                label="Target Close Date"
                type="date"
                value={newDealCloseDate}
                onChange={(e) => setNewDealCloseDate(e.target.value)}
              />

              <div className="pt-fib-13 border-t border-neutral-100 flex items-center justify-end gap-fib-8">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsNewDealOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isCreating}>
                  Create Opportunity
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Deal Confirmation Dialog */}
      {dealToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-fib-13">
          <div
            onClick={() => setDealToDelete(null)}
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in"
          />
          <div className="relative w-full max-w-md skeuo-raised-3 bg-white rounded-xl border border-neutral-200 p-fib-21 z-10 shadow-2xl space-y-fib-13">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-neutral-900">Delete Opportunity</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Are you sure you want to delete <strong className="text-neutral-900">{dealToDelete.title}</strong> ({dealToDelete.company})? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="pt-fib-8 border-t border-neutral-100 flex items-center justify-end gap-fib-8">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDealToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                isLoading={isDeleting}
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={async () => {
                  await deleteDeal(dealToDelete.id);
                  if (selectedDeal?.id === dealToDelete.id) {
                    setSelectedDeal(null);
                  }
                  setDealToDelete(null);
                }}
              >
                Delete Opportunity
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
