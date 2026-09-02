import { useState } from 'react';
import { AIContentCard } from '@/components/patterns/AIContentCard';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { Sparkles, Zap, BrainCircuit, CheckCheck } from 'lucide-react';
import { aiApi } from './api/aiApi';

interface AIRecommendation {
  id: string;
  title: string;
  intentLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  content: string;
  keyPoints: string[];
  suggestedAction: string;
}

export function AICenterPage() {
  const { addToast } = useUIStore();
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [approvedCount, setApprovedCount] = useState(0);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [auditMeta, setAuditMeta] = useState<{ totalDeals: number; totalLeads: number; model: string } | null>(null);

  const handleRunAudit = async () => {
    setIsRunningAudit(true);
    try {
      const response = await aiApi.runPipelineAudit();
      const recs = response?.recommendations || [];
      setRecommendations(recs);
      if (response?.meta) {
        setAuditMeta({
          totalDeals: response.meta.totalDeals,
          totalLeads: response.meta.totalLeads,
          model: response.meta.model,
        });
      }

      if (recs.length === 0) {
        addToast({
          type: 'info',
          title: 'Audit Complete',
          message: 'Workspace database evaluated. All active opportunities are healthy with no immediate risks.',
        });
      } else {
        addToast({
          type: 'ai',
          title: 'Live Pipeline Audit Complete',
          message: `Generated ${recs.length} live actionable recommendations from workspace records.`,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'danger',
        title: 'Audit Failed',
        message: err?.message || 'Could not complete AI pipeline audit.',
      });
    } finally {
      setIsRunningAudit(false);
    }
  };

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
          isLoading={isRunningAudit}
          icon={<Zap className="w-3.5 h-3.5" />}
          onClick={handleRunAudit}
        >
          {isRunningAudit ? 'Analyzing Workspace...' : 'Run Full Pipeline Audit'}
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
            <span className="text-sm font-bold text-neutral-900">
              {auditMeta
                ? `Audited ${auditMeta.totalDeals} Deals & ${auditMeta.totalLeads} Leads`
                : 'Active (Live Monitoring)'}
            </span>
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
              Recommendations Active
            </span>
            <span className="text-sm font-bold text-blue-700 tabular-nums">{recommendations.length} Pending</span>
          </div>
        </div>
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-fib-13">
        <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
          Live Next-Best-Action Feed
        </h3>

        {recommendations.length === 0 ? (
          <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 p-12 text-center space-y-2">
            <BrainCircuit className="w-10 h-10 text-neutral-300 mx-auto" />
            <h4 className="text-sm font-bold text-neutral-800">No Pending AI Risk Alerts</h4>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Autonomous pipeline copilot is continuously analyzing prospect interactions, SLA deadlines, and lead scores. Click 'Run Full Pipeline Audit' to scan all active models.
            </p>
          </div>
        ) : (
          recommendations.map((rec) => (
            <WidgetBoundary key={rec.id} name={`ai-center-${rec.id}`}>
              <AIContentCard
                title={rec.title}
                intentLevel={rec.intentLevel}
                content={rec.content}
                keyPoints={rec.keyPoints}
                suggestedAction={rec.suggestedAction}
                onApprove={() => {
                  setApprovedCount((c) => c + 1);
                  setRecommendations((prev) => prev.filter((r) => r.id !== rec.id));
                  addToast({
                    type: 'ai',
                    title: 'AI Action Executed',
                    message: rec.suggestedAction,
                  });
                }}
                onDiscard={() => {
                  setRecommendations((prev) => prev.filter((r) => r.id !== rec.id));
                  addToast({
                    type: 'info',
                    title: 'Suggestion Dismissed',
                    message: 'Logged feedback.',
                  });
                }}
                onApplyAction={() => {
                  setApprovedCount((c) => c + 1);
                  setRecommendations((prev) => prev.filter((r) => r.id !== rec.id));
                  addToast({
                    type: 'success',
                    title: 'Action Triggered',
                    message: rec.suggestedAction,
                  });
                }}
              />
            </WidgetBoundary>
          ))
        )}
      </div>
    </div>
  );
}
