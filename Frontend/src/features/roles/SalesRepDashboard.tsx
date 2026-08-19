import { KPICard } from '@/components/patterns/KPICard';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import { Button } from '@/components/ui/Button';
import { AIContentCard } from '@/components/patterns/AIContentCard';
import { useUIStore } from '@/stores/uiStore';
import {
  Kanban,
  PhoneCall,
  DollarSign,
  Award,
  Building2,
  CheckCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SalesRepDashboard() {
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  return (
    <div className="space-y-fib-21">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-fib-13 pb-fib-8 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-fib-8 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
              Devon's Closer Cockpit
            </h1>
            <span className="text-[10px] font-bold px-fib-8 py-0.5 rounded-pill bg-green-100 text-green-800 border border-green-300 font-mono">
              Senior AE
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            My active pipeline, high-intent deal closing tasks, and Next-Best-Action AI recommendations.
          </p>
        </div>

        <div className="flex items-center gap-fib-8">
          <Button
            size="sm"
            variant="secondary"
            icon={<PhoneCall className="w-3.5 h-3.5" />}
            onClick={() => navigate('/calls')}
          >
            My Call Queue
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Kanban className="w-3.5 h-3.5" />}
            onClick={() => navigate('/pipeline')}
          >
            Open Pipeline Kanban
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fib-13">
        <WidgetBoundary name="kpi-rep-pipeline">
          <KPICard
            label="My Active Pipeline"
            value="$425,000"
            delta="4 Active Deals"
            deltaDirection="up"
            accent="blue"
            icon={<DollarSign className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-rep-attainment">
          <KPICard
            label="My Quota Attainment"
            value="116%"
            delta="$640k / $550k"
            deltaDirection="up"
            accent="green"
            icon={<Award className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-rep-commission">
          <KPICard
            label="Earned Commission Pace"
            value="$38,400"
            delta="+$6.4k accelerator"
            deltaDirection="up"
            accent="green"
            icon={<DollarSign className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-rep-tasks-due">
          <KPICard
            label="High-Priority Follow-ups"
            value="3 Tasks"
            subtext="Due before 5:00 PM"
            accent="amber"
            icon={<CheckCircle className="w-4 h-4" />}
          />
        </WidgetBoundary>
      </div>

      {/* AI Assistant & Priority Focus Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-fib-21">
        {/* Left Column: AI Recommended Moves (7 cols) */}
        <div className="lg:col-span-7 space-y-fib-13">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
            AI Next Best Actions for Today
          </h3>

          <AIContentCard
            title="High Intent Buying Signal: Apex Capital Logistics"
            intentLevel="HIGH"
            content="Sarah Jenkins viewed the updated SLA contract page twice this morning. Security team approved SOC2 packet."
            keyPoints={[
              'Contract Value: $120,000',
              'Stage: Negotiation (Probability: 85%)',
            ]}
            suggestedAction="Call Sarah at 2:00 PM and present the final discounted invoice."
            onApplyAction={() => {
              addToast({
                type: 'success',
                title: 'Callback Queued',
                message: 'Outreach task scheduled on your calendar for 2:00 PM.',
              });
            }}
          />

          <AIContentCard
            title="Proposal Follow-up: FinVerve Technologies"
            intentLevel="HIGH"
            content="Rajesh Subramaniam requested a comparison with legacy telephony autodialers."
            keyPoints={[
              'Contract Value: $85,000',
              'Key interest: Sub-second voice routing latency',
            ]}
            suggestedAction="Send comparison whitepaper and propose technical sandbox test."
            onApplyAction={() => {
              addToast({
                type: 'info',
                title: 'Whitepaper Sent',
                message: 'Auto-dispatched technical comparison packet to Rajesh.',
              });
            }}
          />
        </div>

        {/* Right Column: Today's Action Schedule (5 cols) */}
        <div className="lg:col-span-5 space-y-fib-13">
          <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 p-fib-21 space-y-fib-13">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Today's Key Appointments
            </h3>

            <div className="space-y-fib-8 text-xs">
              <div className="p-fib-13 rounded-lg bg-neutral-50 border border-neutral-200 space-y-fib-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">Executive Demo with Sarah Jenkins</span>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">2:00 PM</span>
                </div>
                <div className="flex items-center gap-1 text-neutral-500 text-[11px]">
                  <Building2 className="w-3 h-3 text-neutral-400" />
                  <span>Apex Capital Logistics • Zoom Call</span>
                </div>
              </div>

              <div className="p-fib-13 rounded-lg bg-neutral-50 border border-neutral-200 space-y-fib-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">Proposal Review with Rajesh</span>
                  <span className="text-[10px] font-mono bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded">4:30 PM</span>
                </div>
                <div className="flex items-center gap-1 text-neutral-500 text-[11px]">
                  <Building2 className="w-3 h-3 text-neutral-400" />
                  <span>FinVerve Technologies • Phone Call</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
