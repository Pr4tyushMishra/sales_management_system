import { KPICard } from '@/components/patterns/KPICard';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, DollarSign, Award, Target } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

const REVENUE_DATA = [
  { month: 'Apr', revenue: 145000, target: 120000 },
  { month: 'May', revenue: 198000, target: 150000 },
  { month: 'Jun', revenue: 230000, target: 200000 },
  { month: 'Jul', revenue: 285000, target: 250000 },
  { month: 'Aug', revenue: 360000, target: 300000 },
];

const REP_LEADERBOARD = [
  { name: 'Devon Patel', quota: '$550k', attained: '$640k', rate: '116%', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { name: 'Marcus Vance', quota: '$500k', attained: '$520k', rate: '104%', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Elena Rostova', quota: '$300k', attained: '$295k', rate: '98%', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
];

export function ReportsPage() {
  return (
    <div className="space-y-fib-21">
      {/* Header */}
      <div className="pb-fib-8 border-b border-neutral-200">
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
          Executive Reports & Pipeline Analytics
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Real-time ARR tracking, quota attainment, and rep performance intelligence.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fib-13">
        <WidgetBoundary name="kpi-q3-revenue">
          <KPICard
            label="Q3 Attained Revenue"
            value="$1,218,000"
            delta="+24%"
            deltaDirection="up"
            deltaLabel="vs. Q2"
            accent="green"
            icon={<DollarSign className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-quota-attainment">
          <KPICard
            label="Team Quota Attainment"
            value="108.4%"
            delta="+8.4%"
            deltaDirection="up"
            deltaLabel="above quota"
            accent="green"
            icon={<Target className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-win-cycle">
          <KPICard
            label="Avg Sales Cycle"
            value="14.2 Days"
            delta="-3.5 days"
            deltaDirection="up"
            deltaLabel="faster closure"
            accent="blue"
            icon={<TrendingUp className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-top-performer">
          <KPICard
            label="Top Performing Rep"
            value="Devon Patel"
            delta="116% Quota"
            deltaDirection="up"
            accent="violet"
            icon={<Award className="w-4 h-4" />}
          />
        </WidgetBoundary>
      </div>

      {/* Charts Grid: Fibonacci 8:4 proportion */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-fib-21">
        {/* Revenue Velocity Chart (8 cols) */}
        <div className="lg:col-span-8 skeuo-raised-2 bg-white rounded-md border border-neutral-200 p-fib-21 space-y-fib-13">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Monthly Revenue Growth vs. Target
              </h3>
              <p className="text-xs text-neutral-500">
                Green bars indicate booked revenue; dashed baseline shows quarterly plan.
              </p>
            </div>
            <span className="text-xs font-semibold px-fib-8 py-0.5 rounded-pill bg-green-100 text-green-800 border border-green-200">
              On Track
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E1E5EA" />
                <XAxis dataKey="month" stroke="#6B7684" fontSize={11} />
                <YAxis
                  stroke="#6B7684"
                  fontSize={11}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#CBD2D9',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(17,22,29,0.1)',
                  }}
                />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="Actual Revenue" />
                <Bar dataKey="target" fill="#CBD2D9" radius={[4, 4, 0, 0]} name="Target Plan" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard Panel (4 cols) */}
        <div className="lg:col-span-4 skeuo-raised-2 bg-white rounded-md border border-neutral-200 p-fib-21 space-y-fib-13">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Rep Quota Leaderboard
            </h3>
            <Award className="w-4 h-4 text-amber-500" />
          </div>

          <div className="space-y-fib-8">
            {REP_LEADERBOARD.map((rep, idx) => (
              <div
                key={idx}
                className="p-fib-13 rounded-md bg-neutral-50 border border-neutral-200/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-fib-8">
                  <span className="font-bold text-neutral-400 font-mono">#{idx + 1}</span>
                  <Avatar name={rep.name} src={rep.avatarUrl} size="sm" />
                  <div>
                    <span className="font-bold text-neutral-900 block">{rep.name}</span>
                    <span className="text-[11px] text-neutral-500">{rep.attained} of {rep.quota}</span>
                  </div>
                </div>
                <span className="font-bold text-green-700 bg-green-50 px-fib-8 py-0.5 rounded border border-green-200 tabular-nums">
                  {rep.rate}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
