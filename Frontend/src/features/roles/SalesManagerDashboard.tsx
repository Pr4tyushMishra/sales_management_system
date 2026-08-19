import { KPICard } from '@/components/patterns/KPICard';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useUIStore } from '@/stores/uiStore';
import {
  Kanban,
  AlertTriangle,
  Award,
  DollarSign,
  Target,
  CheckCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SalesManagerDashboard() {
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  return (
    <div className="space-y-fib-21">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-fib-13 pb-fib-8 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-fib-8 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
              Sales Manager — Revenue & Pipeline Command
            </h1>
            <span className="text-[10px] font-bold px-fib-8 py-0.5 rounded-pill bg-amber-100 text-amber-800 border border-amber-300 font-mono">
              Team Leadership
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Pipeline health forecasting, quota attainment, high-value deal approvals, and SLA risk mitigation.
          </p>
        </div>

        <div className="flex items-center gap-fib-8">
          <Button
            size="sm"
            variant="secondary"
            icon={<Target className="w-3.5 h-3.5" />}
            onClick={() => navigate('/reports')}
          >
            Quota Leaderboards
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Kanban className="w-3.5 h-3.5" />}
            onClick={() => navigate('/pipeline')}
          >
            Manage Pipeline
          </Button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fib-13">
        <WidgetBoundary name="kpi-team-forecast">
          <KPICard
            label="Weighted Q3 Forecast"
            value="$680,000"
            delta="+18% vs quota"
            deltaDirection="up"
            accent="green"
            icon={<DollarSign className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-manager-at-risk">
          <KPICard
            label="At-Risk Deals Requiring Touch"
            value="1 Deal"
            delta="BlueHarbor Medical ($195k)"
            deltaDirection="down"
            accent="rose"
            icon={<AlertTriangle className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-team-quota">
          <KPICard
            label="Team Quota Attainment"
            value="108.4%"
            delta="On track for $1.5M"
            deltaDirection="up"
            accent="blue"
            icon={<Award className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-approval-queue">
          <KPICard
            label="Pending Discount Approvals"
            value="2 Proposals"
            subtext="Ready for sign-off"
            accent="amber"
            icon={<CheckCircle className="w-4 h-4" />}
          />
        </WidgetBoundary>
      </div>

      {/* Approval Queue & Rep Oversight Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-fib-21">
        {/* Deal Approvals (8 cols) */}
        <div className="lg:col-span-8 space-y-fib-13">
          <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 p-fib-21 space-y-fib-13">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              High-Value Proposals Awaiting Manager Sign-Off
            </h3>

            <div className="space-y-fib-8">
              <div className="p-fib-13 rounded-lg bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-fib-8">
                    <span className="font-bold text-neutral-900">Apex Capital Logistics ($120,000)</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.2 rounded font-bold">15% Volume Discount</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Submitted by Devon Patel • Valid until Sept 30</p>
                </div>
                <div className="flex items-center gap-fib-8">
                  <Button
                    size="xs"
                    variant="success"
                    onClick={() => {
                      addToast({ type: 'success', title: 'Proposal Approved', message: 'Sent to Apex Capital Logistics.' });
                    }}
                  >
                    Approve
                  </Button>
                </div>
              </div>

              <div className="p-fib-13 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-fib-8">
                    <span className="font-bold text-neutral-900">FinVerve Technologies ($85,000)</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.2 rounded font-bold">Standard Tier</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Submitted by Devon Patel • Telecaller Autodialer addon</p>
                </div>
                <div className="flex items-center gap-fib-8">
                  <Button
                    size="xs"
                    variant="success"
                    onClick={() => {
                      addToast({ type: 'success', title: 'Proposal Approved', message: 'Sent to FinVerve Technologies.' });
                    }}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rep Leaderboard (4 cols) */}
        <div className="lg:col-span-4 space-y-fib-13">
          <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 p-fib-21 space-y-fib-13">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              AE Attainment Pace
            </h3>

            <div className="space-y-fib-8 text-xs">
              <div className="flex items-center justify-between p-fib-8 bg-neutral-50 rounded border border-neutral-200">
                <div className="flex items-center gap-fib-8">
                  <Avatar name="Devon Patel" size="sm" status="online" />
                  <div>
                    <span className="font-bold text-neutral-900 block">Devon Patel</span>
                    <span className="text-[10px] text-neutral-500">$640k attained</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                  116%
                </span>
              </div>

              <div className="flex items-center justify-between p-fib-8 bg-neutral-50 rounded border border-neutral-200">
                <div className="flex items-center gap-fib-8">
                  <Avatar name="Elena Rostova" size="sm" status="online" />
                  <div>
                    <span className="font-bold text-neutral-900 block">Elena Rostova</span>
                    <span className="text-[10px] text-neutral-500">$295k attained</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                  98%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
