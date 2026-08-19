import { useState, useEffect } from 'react';
import { CallRecord, CallDisposition } from '@/types';
import { useCalls } from './hooks/useCalls';
import { KPICard } from '@/components/patterns/KPICard';
import { DataTable, ColumnDef } from '@/components/patterns/DataTable';
import { StatusPill } from '@/components/patterns/StatusPill';
import { Button } from '@/components/ui/Button';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import { PermissionGate } from '@/components/system/PermissionGate';
import { useUIStore } from '@/stores/uiStore';
import {
  PhoneCall,
  PhoneForwarded,
  PhoneOff,
  Clock,
  Sparkles,
  Play,
  Pause,
  Building2,
  Mic,
} from 'lucide-react';

export function CallsPage() {
  const { calls, logCall } = useCalls();
  const [activeCall, setActiveCall] = useState<CallRecord | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callNotes, setCallNotes] = useState('');
  const [selectedDisposition, setSelectedDisposition] = useState<CallDisposition>('INTERESTED');
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const { addToast } = useUIStore();

  useEffect(() => {
    let interval: any;
    if (activeCall && activeCall.status === 'CONNECTED') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall]);

  const handleStartCall = (call: CallRecord) => {
    setActiveCall({ ...call, status: 'CONNECTED' });
    setCallDuration(0);
    setCallNotes('');
    addToast({
      type: 'success',
      title: 'Call Connected',
      message: `Direct WebRTC voice stream established with ${call.leadName}.`,
    });
  };

  const handleEndCall = async () => {
    if (!activeCall) return;

    await logCall({
      leadId: activeCall.leadId,
      leadName: activeCall.leadName,
      leadPhone: activeCall.leadPhone,
      leadCompany: activeCall.leadCompany,
      status: 'COMPLETED',
      disposition: selectedDisposition,
      durationSeconds: callDuration,
      notes: callNotes || 'Standard discovery touchpoint completed.',
      aiSentiment: 'POSITIVE',
      transcriptSnippet: "Voice transcript processed: 'Discussion on rollout timeline and procurement approval.'",
    });

    setActiveCall(null);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const columns: ColumnDef<CallRecord>[] = [
    {
      id: 'leadName',
      header: 'Prospect & Company',
      cell: ({ row }) => (
        <div>
          <span className="font-bold text-neutral-900 block">{row.leadName}</span>
          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
            <Building2 className="w-3 h-3 text-neutral-400" />
            <span>{row.leadCompany}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'leadPhone',
      header: 'Phone Number',
      cell: ({ row }) => (
        <span className="font-mono text-neutral-700 text-[11px]">{row.leadPhone}</span>
      ),
    },
    {
      id: 'status',
      header: 'Queue Status',
      cell: ({ row }) => {
        const variantMap: Record<CallRecord['status'], any> = {
          QUEUED: 'warning',
          CONNECTED: 'success',
          COMPLETED: 'neutral',
          MISSED: 'danger',
          RINGING: 'info',
          BUSY: 'danger',
        };
        return <StatusPill label={row.status} variant={variantMap[row.status]} />;
      },
    },
    {
      id: 'duration',
      header: 'Duration',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono text-xs tabular-nums text-neutral-700">
          {row.durationSeconds > 0 ? formatSeconds(row.durationSeconds) : '—'}
        </span>
      ),
    },
    {
      id: 'sentiment',
      header: 'AI Sentiment',
      cell: ({ row }) => {
        if (!row.aiSentiment) return <span className="text-neutral-400 text-xs">—</span>;
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-fib-5 py-0.5 rounded border border-green-200">
            <Sparkles className="w-3 h-3 text-green-600" />
            {row.aiSentiment}
          </span>
        );
      },
    },
    {
      id: 'action',
      header: 'Action',
      align: 'right',
      cell: ({ row }) => {
        if (row.status === 'QUEUED') {
          return (
            <Button
              size="xs"
              variant="success"
              icon={<PhoneCall className="w-3 h-3" />}
              onClick={() => handleStartCall(row)}
            >
              Dial Now
            </Button>
          );
        }
        return (
          <button
            onClick={() => {
              setIsPlayingAudio(isPlayingAudio === row.id ? null : row.id);
              if (isPlayingAudio !== row.id) {
                addToast({
                  type: 'info',
                  title: 'Playing Call Audio',
                  message: `Simulated playback for ${row.leadName}`,
                });
              }
            }}
            className="skeuo-btn-secondary px-fib-8 py-1 rounded text-xs flex items-center gap-1 text-neutral-700 font-medium"
          >
            {isPlayingAudio === row.id ? (
              <>
                <Pause className="w-3 h-3 text-blue-600" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-neutral-500" />
                <span>Recording</span>
              </>
            )}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-fib-21">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-fib-13 pb-fib-8 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Telecaller Queue & Voice Intelligence
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Single-click autodialer, real-time AI sentiment analysis, and disposition tracking.
          </p>
        </div>

        <PermissionGate permission="call.make">
          <Button
            variant="primary"
            size="sm"
            icon={<PhoneForwarded className="w-3.5 h-3.5" />}
            onClick={() => {
              const queued = calls.find((c) => c.status === 'QUEUED');
              if (queued) handleStartCall(queued);
              else addToast({ type: 'info', title: 'No calls in queue', message: 'All scheduled calls completed.' });
            }}
          >
            Start Speed Queue
          </Button>
        </PermissionGate>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fib-13">
        <WidgetBoundary name="kpi-calls-completed">
          <KPICard
            label="Calls Completed Today"
            value="48"
            delta="+14%"
            deltaDirection="up"
            deltaLabel="vs. yesterday"
            accent="blue"
            icon={<PhoneCall className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-avg-talk-time">
          <KPICard
            label="Avg Talk Time"
            value="5m 32s"
            delta="+45s"
            deltaDirection="up"
            deltaLabel="higher engagement"
            accent="green"
            icon={<Clock className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-positive-sentiment">
          <KPICard
            label="Positive Sentiment Rate"
            value="78%"
            delta="+6%"
            deltaDirection="up"
            deltaLabel="AI verified"
            accent="green"
            icon={<Sparkles className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-queue-pending">
          <KPICard
            label="Queue Remaining"
            value={calls.filter((c) => c.status === 'QUEUED').length}
            subtext="Ready to dial"
            accent="amber"
            icon={<PhoneForwarded className="w-4 h-4" />}
          />
        </WidgetBoundary>
      </div>

      {/* Active Call Live Control Console Modal */}
      {activeCall && (
        <div className="skeuo-raised-3 bg-neutral-900 border border-blue-500/40 rounded-xl p-fib-21 text-white shadow-2xl space-y-fib-13 animate-in zoom-in-95">
          <div className="flex flex-wrap items-center justify-between gap-fib-13 border-b border-neutral-800 pb-fib-13">
            <div className="flex items-center gap-fib-13">
              <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500 text-green-400 flex items-center justify-center animate-pulse">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-fib-8">
                  <h3 className="text-base font-bold">{activeCall.leadName}</h3>
                  <span className="text-[10px] bg-green-500/20 text-green-300 border border-green-500/40 px-fib-5 py-0.5 rounded font-mono">
                    LIVE CALL
                  </span>
                </div>
                <p className="text-xs text-neutral-400">
                  {activeCall.leadCompany} • {activeCall.leadPhone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-fib-13">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                  Live Call Timer
                </span>
                <span className="text-2xl font-mono font-bold text-green-400 tabular-nums">
                  {formatSeconds(callDuration)}
                </span>
              </div>
              <Button
                variant="danger"
                size="sm"
                icon={<PhoneOff className="w-4 h-4" />}
                onClick={handleEndCall}
              >
                Hang Up & Save
              </Button>
            </div>
          </div>

          {/* Real-time AI Sentiment Assistant Strip */}
          <div className="p-fib-13 bg-neutral-800/80 rounded-md border border-neutral-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-fib-8 text-violet-300 font-medium">
              <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
              <span>
                Real-time AI Sentiment: <strong className="text-green-400">High Interest</strong> — Prospect asking about deployment timeline.
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">Real-time Stream OK</span>
          </div>

          {/* Disposition & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-fib-13 pt-1">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Call Disposition *
              </label>
              <select
                value={selectedDisposition}
                onChange={(e) => setSelectedDisposition(e.target.value as CallDisposition)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-fib-8 text-xs text-white outline-none"
              >
                <option value="INTERESTED">Interested (Send Proposal)</option>
                <option value="MEETING_BOOKED">Meeting Booked</option>
                <option value="CALLBACK_REQUESTED">Callback Requested</option>
                <option value="NOT_INTERESTED">Not Interested</option>
                <option value="VOICEMAIL">Left Voicemail</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Quick Meeting / Call Notes
              </label>
              <input
                type="text"
                placeholder="Type bullet notes here during conversation..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-fib-8 text-xs text-white placeholder:text-neutral-500 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Calls Table */}
      <WidgetBoundary name="calls-history-table">
        <DataTable
          columns={columns}
          data={calls}
          keyExtractor={(call) => call.id}
          searchPlaceholder="Search calls by contact name, phone, or company..."
        />
      </WidgetBoundary>
    </div>
  );
}
