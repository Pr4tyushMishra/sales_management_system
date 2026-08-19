import { KPICard } from '@/components/patterns/KPICard';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import { Button } from '@/components/ui/Button';
import {
  Users,
  Flame,
  Globe,
  Share2,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MarketingSDRDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-fib-21">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-fib-13 pb-fib-8 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-fib-8 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
              Marketing & Inbound SDR Lead Center
            </h1>
            <span className="text-[10px] font-bold px-fib-8 py-0.5 rounded-pill bg-indigo-100 text-indigo-800 border border-indigo-300 font-mono">
              Inbound Capture
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Multi-channel campaign attribution, autonomous lead scoring triage, and real-time SDR routing.
          </p>
        </div>

        <div className="flex items-center gap-fib-8">
          <Button
            size="sm"
            variant="secondary"
            icon={<Filter className="w-3.5 h-3.5" />}
            onClick={() => navigate('/leads')}
          >
            Filter Leads
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Users className="w-3.5 h-3.5" />}
            onClick={() => navigate('/inbox')}
          >
            Open Inbound Inbox
          </Button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fib-13">
        <WidgetBoundary name="kpi-inbound-volume">
          <KPICard
            label="Inbound Leads Captured (24h)"
            value="34"
            delta="+28% WoW"
            deltaDirection="up"
            accent="blue"
            icon={<Globe className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-hot-lead-rate">
          <KPICard
            label="AI Qualified Hot Rate"
            value="41.2%"
            delta="+5.4%"
            deltaDirection="up"
            accent="rose"
            icon={<Flame className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-sdr-touch-speed">
          <KPICard
            label="Median First Touch SLA"
            value="3m 15s"
            delta="-1m 20s"
            deltaDirection="up"
            accent="green"
            icon={<TrendingUp className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-campaign-cvr">
          <KPICard
            label="Top Source: Meta & LinkedIn Ads"
            value="62% Share"
            subtext="Highest SQL conversion"
            accent="blue"
            icon={<Share2 className="w-4 h-4" />}
          />
        </WidgetBoundary>
      </div>

      {/* Attribution Channels Breakdown */}
      <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 p-fib-21 space-y-fib-13">
        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
          Active Inbound Campaign Sources & Velocity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-fib-13 text-xs">
          <div className="p-fib-13 rounded-lg bg-blue-50/60 border border-blue-200 space-y-fib-5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900">Website High-Intent Form</span>
              <span className="text-[10px] font-bold text-green-700 bg-white px-2 py-0.5 rounded">94 Avg Score</span>
            </div>
            <p className="text-[11px] text-neutral-600">18 Prospects captured this week. Auto-routed to Senior AE team.</p>
          </div>

          <div className="p-fib-13 rounded-lg bg-indigo-50/60 border border-indigo-200 space-y-fib-5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-900">LinkedIn Sponsored Outreach</span>
              <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded">86 Avg Score</span>
            </div>
            <p className="text-[11px] text-neutral-600">11 Executives engaged with Enterprise whitepaper.</p>
          </div>

          <div className="p-fib-13 rounded-lg bg-neutral-100/70 border border-neutral-200 space-y-fib-5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900">Meta Ads Retargeting</span>
              <span className="text-[10px] font-bold text-neutral-700 bg-white px-2 py-0.5 rounded">62 Avg Score</span>
            </div>
            <p className="text-[11px] text-neutral-600">5 Demo inquiries received. Automated WhatsApp follow-up active.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
