import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { KPICard } from '@/components/patterns/KPICard';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import { Avatar } from '@/components/ui/Avatar';
import { useUIStore } from '@/stores/uiStore';
import { Users, Shield, HardDrive, Key, UserCheck, Plus } from 'lucide-react';

const TEAM_MEMBERS = [
  { name: 'Sarah Chen', role: 'ORG_ADMIN', email: 'sarah.c@acmecorp.com', seats: 'Active', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
  { name: 'Marcus Vance', role: 'SALES_MANAGER', email: 'marcus.v@acmecorp.com', seats: 'Active', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { name: 'Devon Patel', role: 'SALES_REP', email: 'devon.p@acmecorp.com', seats: 'Active', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { name: 'Elena Rostova', role: 'TELECALLER', email: 'elena.r@acmecorp.com', seats: 'Active', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80' },
];

export function AdminPage() {
  const { addToast } = useUIStore();
  const [members] = useState(TEAM_MEMBERS);

  return (
    <div className="space-y-fib-21">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-fib-13 pb-fib-8 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Organization Admin & Seat Provisioning
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Role-based access control, seat utilization, API credentials, and tenant parameters.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => {
            addToast({
              type: 'info',
              title: 'Invite Team Member',
              message: 'Invitation link generated and ready to share.',
            });
          }}
        >
          Invite Member
        </Button>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fib-13">
        <WidgetBoundary name="kpi-seat-usage">
          <KPICard
            label="Active Seats Utilized"
            value="42 / 50"
            delta="8 Available"
            deltaDirection="up"
            accent="blue"
            icon={<Users className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-role-types">
          <KPICard
            label="Configured Roles"
            value="7 Roles"
            subtext="RBAC with zero-trust"
            accent="neutral"
            icon={<Shield className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-api-keys">
          <KPICard
            label="Active API Webhooks"
            value="6 Live"
            subtext="99.99% deliverability"
            accent="green"
            icon={<Key className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-cloud-storage">
          <KPICard
            label="Call Audio Storage"
            value="148 GB"
            subtext="Encrypted with AES-256"
            accent="neutral"
            icon={<HardDrive className="w-4 h-4" />}
          />
        </WidgetBoundary>
      </div>

      {/* Team Member Management Table */}
      <WidgetBoundary name="admin-team-table">
        <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 overflow-hidden">
          <div className="p-fib-13 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
              Tenant User Roster & Role Assignments
            </h3>
            <span className="text-[11px] font-semibold text-neutral-500 font-mono">
              {members.length} Users Enrolled
            </span>
          </div>

          <div className="divide-y divide-neutral-100">
            {members.map((m, i) => (
              <div
                key={i}
                className="p-fib-13 flex items-center justify-between gap-fib-13 hover:bg-neutral-50 transition-colors text-xs"
              >
                <div className="flex items-center gap-fib-13">
                  <Avatar name={m.name} src={m.avatarUrl} size="md" status="online" />
                  <div>
                    <span className="font-bold text-neutral-900 block">{m.name}</span>
                    <span className="text-[11px] text-neutral-500 font-mono">{m.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-fib-13">
                  <span className="text-[10px] font-bold px-fib-8 py-0.5 rounded-pill bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                    {m.role}
                  </span>
                  <span className="text-neutral-600 font-medium flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-green-600" />
                    {m.seats}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </WidgetBoundary>
    </div>
  );
}
