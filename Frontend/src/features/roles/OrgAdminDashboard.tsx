import { KPICard } from '@/components/patterns/KPICard';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useUIStore } from '@/stores/uiStore';
import {
  Users,
  DollarSign,
  TrendingUp,
  CreditCard,
  Key,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function OrgAdminDashboard() {
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  return (
    <div className="space-y-fib-21">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-fib-13 pb-fib-8 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-fib-8 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
              Organization Admin Command Center
            </h1>
            <span className="text-[10px] font-bold px-fib-8 py-0.5 rounded-pill bg-blue-100 text-blue-800 border border-blue-200 font-mono">
              Acme Enterprise Inc.
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Company-wide RevOps overview, team seat allocation, billing status, and sales velocity metrics.
          </p>
        </div>

        <div className="flex items-center gap-fib-8">
          <Button
            size="sm"
            variant="secondary"
            icon={<Key className="w-3.5 h-3.5" />}
            onClick={() => navigate('/admin')}
          >
            Manage API & Webhooks
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Users className="w-3.5 h-3.5" />}
            onClick={() => {
              addToast({ type: 'info', title: 'Seat Provisioning', message: '42 of 50 Enterprise seats utilized.' });
            }}
          >
            Provision Seats
          </Button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fib-13">
        <WidgetBoundary name="kpi-org-arr">
          <KPICard
            label="Annual Recurring Revenue (ARR)"
            value="$1,218,000"
            delta="+24% YoY"
            deltaDirection="up"
            accent="green"
            icon={<DollarSign className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-active-team">
          <KPICard
            label="Licensed Sales Seats"
            value="42 / 50"
            delta="8 Seats Open"
            deltaDirection="up"
            accent="blue"
            icon={<Users className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-win-rate-org">
          <KPICard
            label="Company Win Rate"
            value="68.4%"
            delta="+5.2%"
            deltaDirection="up"
            deltaLabel="vs. target"
            accent="green"
            icon={<TrendingUp className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-invoices-due">
          <KPICard
            label="Receivables Collected"
            value="$240,000"
            subtext="0 Overdue"
            accent="neutral"
            icon={<CreditCard className="w-4 h-4" />}
          />
        </WidgetBoundary>
      </div>

      {/* Fibonacci 8:4 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-fib-21">
        {/* Left Column (8 cols): Department Performance & SLA Health */}
        <div className="lg:col-span-8 space-y-fib-13">
          <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 p-fib-21 space-y-fib-13">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Departmental RevOps Health
            </h3>

            <div className="space-y-fib-8">
              <div className="p-fib-13 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-neutral-900 block">Outbound Telecaller Desk</span>
                  <span className="text-[11px] text-neutral-500">12 Active Callers • 48 Calls Today</span>
                </div>
                <div className="flex items-center gap-fib-8">
                  <span className="text-[10px] font-bold px-fib-8 py-0.5 rounded-pill bg-green-100 text-green-800 border border-green-200">
                    SLA Compliant (4.2m)
                  </span>
                  <Button size="xs" variant="ghost" onClick={() => navigate('/calls')}>
                    View Desk <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="p-fib-13 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-neutral-900 block">Account Executives & Pipeline</span>
                  <span className="text-[11px] text-neutral-500">18 Reps • $680,000 in Active Deals</span>
                </div>
                <div className="flex items-center gap-fib-8">
                  <span className="text-[10px] font-bold px-fib-8 py-0.5 rounded-pill bg-green-100 text-green-800 border border-green-200">
                    116% Quota Pace
                  </span>
                  <Button size="xs" variant="ghost" onClick={() => navigate('/pipeline')}>
                    View Pipeline <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="p-fib-13 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-neutral-900 block">Inbound SDR Routing & WhatsApp Lead Hub</span>
                  <span className="text-[11px] text-neutral-500">6 SDRs • Sub-second automated triage</span>
                </div>
                <div className="flex items-center gap-fib-8">
                  <span className="text-[10px] font-bold px-fib-8 py-0.5 rounded-pill bg-blue-100 text-blue-800 border border-blue-200">
                    AI Auto-Scoring 94%
                  </span>
                  <Button size="xs" variant="ghost" onClick={() => navigate('/inbox')}>
                    View Inbox <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Team Leadership Quick Access */}
        <div className="lg:col-span-4 space-y-fib-13">
          <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 p-fib-21 space-y-fib-13">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Tenant Administrators
            </h3>

            <div className="space-y-fib-8 text-xs">
              <div className="flex items-center justify-between p-fib-8 bg-neutral-50 rounded border border-neutral-200">
                <div className="flex items-center gap-fib-8">
                  <Avatar name="Sarah Chen" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" size="sm" status="online" />
                  <div>
                    <span className="font-bold text-neutral-900 block">Sarah Chen</span>
                    <span className="text-[10px] text-neutral-500">VP Ops (Org Admin)</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Owner</span>
              </div>

              <div className="flex items-center justify-between p-fib-8 bg-neutral-50 rounded border border-neutral-200">
                <div className="flex items-center gap-fib-8">
                  <Avatar name="Marcus Vance" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" size="sm" status="online" />
                  <div>
                    <span className="font-bold text-neutral-900 block">Marcus Vance</span>
                    <span className="text-[10px] text-neutral-500">Sales Director</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">Manager</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
