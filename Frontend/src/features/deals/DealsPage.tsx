import { useState } from 'react';
import { Deal, DealStage } from '@/types';
import { KanbanBoard, KanbanColumn } from '@/components/patterns/KanbanBoard';
import { KPICard } from '@/components/patterns/KPICard';
import { SlideOverPanel } from '@/components/patterns/SlideOverPanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
} from 'lucide-react';

import { useDeals } from './hooks/useDeals';

export function DealsPage() {
  const { deals, createDeal, moveStage } = useDeals();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);

  // Form State
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealCompany, setNewDealCompany] = useState('');
  const [newDealContact, setNewDealContact] = useState('');
  const [newDealValue, setNewDealValue] = useState('75000');
  const [newDealStage, setNewDealStage] = useState<DealStage>('DISCOVERY');

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
    if (!newDealTitle || !newDealCompany) return;

    await createDeal({
      title: newDealTitle,
      company: newDealCompany,
      contactName: newDealContact || 'Key Contact',
      value: Number(newDealValue) || 75000,
      stage: newDealStage,
      probability: newDealStage === 'WON' ? 100 : 50,
      expectedCloseDate: '2026-09-30',
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
    (deals.filter((d) => d.stage === 'WON').length / deals.length) * 100
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
            delta="+$120k"
            deltaDirection="up"
            deltaLabel="active opps"
            accent="blue"
            icon={<DollarSign className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-won-revenue">
          <KPICard
            label="Closed Won Revenue"
            value={`$${wonRevenue.toLocaleString()}`}
            delta="+22%"
            deltaDirection="up"
            deltaLabel="this quarter"
            accent="green"
            icon={<Award className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-win-rate">
          <KPICard
            label="Forecast Win Rate"
            value={`${winRate}%`}
            delta="+5%"
            deltaDirection="up"
            deltaLabel="vs. target"
            accent="green"
            icon={<TrendingUp className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-at-risk-deals">
          <KPICard
            label="At-Risk Deals"
            value={deals.filter((d) => d.health === 'AT_RISK').length}
            delta="1 deal"
            deltaDirection="down"
            deltaLabel="requires manager touch"
            accent="rose"
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

              <div className="grid grid-cols-2 gap-fib-13">
                <Input
                  label="Deal Value ($)"
                  type="number"
                  value={newDealValue}
                  onChange={(e) => setNewDealValue(e.target.value)}
                />
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Initial Stage
                  </label>
                  <select
                    value={newDealStage}
                    onChange={(e) => setNewDealStage(e.target.value as DealStage)}
                    className="w-full skeuo-sunken text-xs px-fib-8 py-fib-8 rounded-md bg-neutral-100 border border-neutral-300 text-neutral-900 outline-none"
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-fib-13 border-t border-neutral-100 flex items-center justify-end gap-fib-8">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsNewDealOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Create Opportunity
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
