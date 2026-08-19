import { useState } from 'react';
import { AIContentCard } from '@/components/patterns/AIContentCard';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { Sparkles, Zap, BrainCircuit, CheckCheck } from 'lucide-react';

import { useAI } from './hooks/useAI';

export function AICenterPage() {
  const { addToast } = useUIStore();
  const { generateLeadSummary, isAnalyzingLead } = useAI();
  const [approvedCount, setApprovedCount] = useState(2);

  const handleRunAudit = async () => {
    try {
      await generateLeadSummary('lead_01');
    } catch {
      // Graceful fallback handled in hook
    }
  };

  const recommendations = [
    {
      id: 'ai_rec_01',
      title: 'Stalled Deal Risk Alert: BlueHarbor Medical ($195,000)',
      intentLevel: 'HIGH' as const,
      content:
        'No rep touch recorded for 5 days. Decision maker visited SOC2 compliance page twice this morning. Deal probability dropped by 15%.',
      keyPoints: [
        'SDR response SLA breached yesterday',
        'Decision maker actively reading security docs',
      ],
      suggestedAction: 'Auto-dispatch security packet and trigger 15-minute callback alert for Jordan Miller.',
    },
    {
      id: 'ai_rec_02',
      title: 'High Conversion Upsell Opportunity: CyberShield Global',
      intentLevel: 'HIGH' as const,
      content:
        'Client usage surpassed 92% of seat threshold. Monthly active call volume grew 40% month-over-month.',
      keyPoints: [
        'Contract renews in 60 days',
        'High likelihood of accepting 100-seat expansion quote',
      ],
      suggestedAction: 'Draft and propose Enterprise 100-Seat Add-on quote for $60,000 ARR increase.',
    },
    {
      id: 'ai_rec_03',
      title: 'Optimized Telecaller Queue Routing',
      intentLevel: 'MEDIUM' as const,
      content:
        'Inbound prospects in Pacific Time zone exhibit 3.2x higher connection rates between 2:00 PM and 4:30 PM PST.',
      keyPoints: [
        '14 West Coast leads pending in dialer queue',
        'Current rep allocation under-indexed on afternoon hours',
      ],
      suggestedAction: 'Re-prioritize Pacific Time leads to top of afternoon outreach queue.',
    },
  ];

  return (
    <div className="space-y-fib-21">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-fib-13 pb-fib-8 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-fib-8 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
              AI Intelligence Center & Next-Best-Action
            </h1>
            <span className="text-[10px] font-bold px-fib-8 py-0.5 rounded-pill bg-violet-100 text-violet-800 border border-violet-200 uppercase font-mono">
              Autonomous Copilot
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Real-time pipeline intent scoring, risk mitigation recommendations, and revenue signals.
          </p>
        </div>

        <Button
          variant="ai"
          size="sm"
          isLoading={isAnalyzingLead}
          icon={<Zap className="w-3.5 h-3.5" />}
          onClick={handleRunAudit}
        >
          {isAnalyzingLead ? 'Running Audit...' : 'Run Full Pipeline Audit'}
        </Button>
      </div>

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-fib-13">
        <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 p-fib-13 flex items-center gap-fib-13">
          <div className="p-fib-8 rounded-lg bg-violet-100 text-violet-700 border border-violet-200">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-neutral-400 block tracking-wider">
              Autonomous AI Copilot
            </span>
            <span className="text-sm font-bold text-neutral-900">Active (Continuous Stream)</span>
          </div>
        </div>

        <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 p-fib-13 flex items-center gap-fib-13">
          <div className="p-fib-8 rounded-lg bg-green-100 text-green-700 border border-green-200">
            <CheckCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-neutral-400 block tracking-wider">
              Approved Action Items
            </span>
            <span className="text-sm font-bold text-neutral-900 tabular-nums">
              {approvedCount} Actions Executed
            </span>
          </div>
        </div>

        <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 p-fib-13 flex items-center gap-fib-13">
          <div className="p-fib-8 rounded-lg bg-blue-100 text-blue-700 border border-blue-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-neutral-400 block tracking-wider">
              Revenue Saved
            </span>
            <span className="text-sm font-bold text-green-700 tabular-nums">+$315,000 ARR</span>
          </div>
        </div>
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-fib-13">
        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
          Live Next-Best-Action Feed
        </h3>

        {recommendations.map((rec) => (
          <WidgetBoundary key={rec.id} name={`ai-center-${rec.id}`}>
            <AIContentCard
              title={rec.title}
              intentLevel={rec.intentLevel}
              content={rec.content}
              keyPoints={rec.keyPoints}
              suggestedAction={rec.suggestedAction}
              onApprove={() => {
                setApprovedCount((c) => c + 1);
                addToast({
                  type: 'ai',
                  title: 'AI Action Executed',
                  message: rec.suggestedAction,
                });
              }}
              onDiscard={() => {
                addToast({
                  type: 'info',
                  title: 'Suggestion Dismissed',
                  message: 'Logged feedback.',
                });
              }}
              onApplyAction={() => {
                setApprovedCount((c) => c + 1);
                addToast({
                  type: 'success',
                  title: 'Action Triggered',
                  message: rec.suggestedAction,
                });
              }}
            />
          </WidgetBoundary>
        ))}
      </div>
    </div>
  );
}
