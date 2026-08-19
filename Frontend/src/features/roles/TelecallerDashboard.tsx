import { useState, useEffect } from 'react';
import { KPICard } from '@/components/patterns/KPICard';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import { Button } from '@/components/ui/Button';
import { useCalls } from '../calls/hooks/useCalls';
import { CallRecord, CallDisposition } from '@/types';
import { useUIStore } from '@/stores/uiStore';
import {
  PhoneCall,
  PhoneForwarded,
  PhoneOff,
  Clock,
  Mic,
  Headphones,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

export function TelecallerDashboard() {
  const { addToast } = useUIStore();
  const { calls, logCall } = useCalls();

  const [activeCall, setActiveCall] = useState<CallRecord | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callNotes, setCallNotes] = useState('');
  const [selectedDisposition, setSelectedDisposition] = useState<CallDisposition>('MEETING_BOOKED');

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
      title: 'Dialing Prospect',
      message: `Direct line connected to ${call.leadName} (${call.leadPhone}).`,
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
      notes: callNotes || 'Outreach touch completed.',
      aiSentiment: 'POSITIVE',
    });

    setActiveCall(null);

    addToast({
      type: 'success',
      title: 'Call Dispatched & Logged',
      message: `Disposition logged as ${selectedDisposition}. Next lead loading...`,
    });
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-fib-21">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-fib-13 pb-fib-8 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-fib-8 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
              Elena's High-Velocity Telecaller Console
            </h1>
            <span className="text-[10px] font-bold px-fib-8 py-0.5 rounded-pill bg-rose-100 text-rose-800 border border-rose-300 font-mono">
              Speed Queue
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Sub-second autodialer queue, real-time dynamic pitch script, and rapid 1-click disposition logging.
          </p>
        </div>

        <div className="flex items-center gap-fib-8">
          <Button
            size="sm"
            variant="primary"
            icon={<PhoneForwarded className="w-3.5 h-3.5" />}
            onClick={() => {
              const queued = calls.find((c) => c.status === 'QUEUED');
              if (queued) handleStartCall(queued);
              else addToast({ type: 'info', title: 'Queue Complete', message: 'All scheduled outbound calls done!' });
            }}
          >
            Start Speed Dial
          </Button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fib-13">
        <WidgetBoundary name="kpi-tele-completed">
          <KPICard
            label="Calls Completed Today"
            value="48 / 60"
            delta="80% Goal"
            deltaDirection="up"
            accent="blue"
            icon={<PhoneCall className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-tele-connect-rate">
          <KPICard
            label="Live Connect Rate"
            value="64.2%"
            delta="+8.1%"
            deltaDirection="up"
            accent="green"
            icon={<TrendingUp className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-tele-meetings">
          <KPICard
            label="Meetings Booked"
            value="6 Today"
            delta="+2 vs quota"
            deltaDirection="up"
            accent="green"
            icon={<CheckCircle className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-tele-avg-talk">
          <KPICard
            label="Avg Talk Duration"
            value="4m 12s"
            subtext="Optimal discovery time"
            accent="neutral"
            icon={<Clock className="w-4 h-4" />}
          />
        </WidgetBoundary>
      </div>

      {/* Active Call Live Control Console */}
      {activeCall ? (
        <div className="skeuo-raised-3 bg-neutral-900 border border-green-500/40 rounded-xl p-fib-21 text-white shadow-2xl space-y-fib-13 animate-in zoom-in-95">
          <div className="flex flex-wrap items-center justify-between gap-fib-13 border-b border-neutral-800 pb-fib-13">
            <div className="flex items-center gap-fib-13">
              <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500 text-green-400 flex items-center justify-center animate-pulse">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-fib-8">
                  <h3 className="text-base font-bold">{activeCall.leadName}</h3>
                  <span className="text-[10px] bg-green-500/20 text-green-300 border border-green-500/40 px-fib-5 py-0.5 rounded font-mono">
                    LIVE CALLING
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
                  Call Elapsed
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
                End Call & Log
              </Button>
            </div>
          </div>

          {/* Script Prompt Assist */}
          <div className="p-fib-13 bg-neutral-800 rounded-md border border-neutral-700 text-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 block">
              Suggested Discovery Pitch Script:
            </span>
            <p className="text-neutral-200">
              "Hi Chloe, I noticed you recently reviewed our revenue automation specs. Are you looking to integrate autodialer routing for your incoming prospects this quarter?"
            </p>
          </div>

          {/* Disposition Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-fib-13">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Fast Disposition *
              </label>
              <select
                value={selectedDisposition}
                onChange={(e) => setSelectedDisposition(e.target.value as CallDisposition)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-fib-8 text-xs text-white outline-none"
              >
                <option value="MEETING_BOOKED">Meeting Booked (Demo Confirmed)</option>
                <option value="INTERESTED">Interested (Send Proposal)</option>
                <option value="CALLBACK_REQUESTED">Callback Requested</option>
                <option value="NOT_INTERESTED">Not Interested</option>
                <option value="VOICEMAIL">Left Voicemail</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Meeting Note / Objection
              </label>
              <input
                type="text"
                placeholder="Key discovery takeaways..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-fib-8 text-xs text-white placeholder:text-neutral-500 outline-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="skeuo-raised-2 bg-white rounded-xl border border-neutral-200 p-fib-21 flex flex-col items-center justify-center text-center space-y-fib-8">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center justify-center">
            <Headphones className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-neutral-900">Autodialer Ready</h3>
          <p className="text-xs text-neutral-500 max-w-sm">
            Click 'Start Speed Dial' to automatically connect to the next queued prospect with sub-second latency.
          </p>
        </div>
      )}
    </div>
  );
}
