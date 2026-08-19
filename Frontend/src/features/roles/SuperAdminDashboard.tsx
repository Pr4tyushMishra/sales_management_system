import { useState } from 'react';
import { KPICard } from '@/components/patterns/KPICard';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import { DataTable, ColumnDef } from '@/components/patterns/DataTable';
import { StatusPill } from '@/components/patterns/StatusPill';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import {
  ShieldAlert,
  Server,
  Activity,
  HardDrive,
  Building2,
  RefreshCw,
  Cpu,
  Zap,
} from 'lucide-react';

interface TenantOrg {
  id: string;
  name: string;
  tier: 'ENTERPRISE_PLUS' | 'ENTERPRISE' | 'PRO';
  activeUsers: number;
  maxUsers: number;
  storageGb: number;
  apiCalls24h: number;
  health: 'HEALTHY' | 'WARNING' | 'DEGRADED';
  slaStatus: 'COMPLIANT' | 'AT_RISK';
}

const MOCK_TENANTS: TenantOrg[] = [
  { id: 'org_acme_corp', name: 'Acme Enterprise Inc.', tier: 'ENTERPRISE_PLUS', activeUsers: 42, maxUsers: 50, storageGb: 148, apiCalls24h: 184500, health: 'HEALTHY', slaStatus: 'COMPLIANT' },
  { id: 'org_apex_global', name: 'Apex Capital Logistics', tier: 'ENTERPRISE', activeUsers: 28, maxUsers: 30, storageGb: 89, apiCalls24h: 92300, health: 'HEALTHY', slaStatus: 'COMPLIANT' },
  { id: 'org_nordic_tech', name: 'Nordic AI Solutions', tier: 'PRO', activeUsers: 14, maxUsers: 15, storageGb: 34, apiCalls24h: 41200, health: 'WARNING', slaStatus: 'AT_RISK' },
  { id: 'org_finverve', name: 'FinVerve Technologies', tier: 'ENTERPRISE', activeUsers: 35, maxUsers: 40, storageGb: 112, apiCalls24h: 138000, health: 'HEALTHY', slaStatus: 'COMPLIANT' },
];

export function SuperAdminDashboard() {
  const [tenants] = useState<TenantOrg[]>(MOCK_TENANTS);
  const { addToast } = useUIStore();

  const columns: ColumnDef<TenantOrg>[] = [
    {
      id: 'name',
      header: 'Tenant Organization',
      cell: ({ row }) => (
        <div className="flex items-center gap-fib-8">
          <div className="w-8 h-8 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-neutral-900 block">{row.name}</span>
            <span className="text-[10px] text-neutral-500 font-mono">ID: {row.id}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'tier',
      header: 'Plan Tier',
      cell: ({ row }) => (
        <span className="text-[10px] font-bold px-fib-8 py-0.5 rounded-pill bg-violet-50 text-violet-800 border border-violet-200 font-mono">
          {row.tier}
        </span>
      ),
    },
    {
      id: 'seats',
      header: 'Seat Utilization',
      cell: ({ row }) => (
        <span className="font-mono text-xs tabular-nums text-neutral-800">
          {row.activeUsers} / {row.maxUsers} ({Math.round((row.activeUsers / row.maxUsers) * 100)}%)
        </span>
      ),
    },
    {
      id: 'apiCalls',
      header: '24h API Volume',
      align: 'right',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold tabular-nums text-neutral-900">
          {row.apiCalls24h.toLocaleString()} req
        </span>
      ),
    },
    {
      id: 'health',
      header: 'VPC Health',
      cell: ({ row }) => (
        <StatusPill
          label={row.health}
          variant={row.health === 'HEALTHY' ? 'success' : row.health === 'WARNING' ? 'warning' : 'danger'}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Action',
      align: 'right',
      cell: ({ row }) => (
        <Button
          size="xs"
          variant="secondary"
          onClick={() => {
            addToast({
              type: 'info',
              title: `Inspecting ${row.name}`,
              message: 'Opened tenant audit log telemetry stream.',
            });
          }}
        >
          Audit VPC
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-fib-21">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-fib-13 pb-fib-8 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-fib-8 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
              Super Admin — Platform Infrastructure Command
            </h1>
            <span className="text-[10px] font-bold px-fib-8 py-0.5 rounded-pill bg-violet-100 text-violet-800 border border-violet-300 font-mono">
              Root Level
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Multi-tenant cluster health, cross-organization audits, sub-second latency telemetry, and SLA governance.
          </p>
        </div>

        <div className="flex items-center gap-fib-8">
          <Button
            size="sm"
            variant="secondary"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => {
              addToast({ type: 'info', title: 'Telemetry Synced', message: 'All clusters reporting nominal status.' });
            }}
          >
            Refresh Telemetry
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={<Zap className="w-3.5 h-3.5" />}
            onClick={() => {
              addToast({ type: 'success', title: 'Global Health Check Passed', message: 'Latency: 14ms across all VPC regions.' });
            }}
          >
            Run Cluster Diagnostic
          </Button>
        </div>
      </div>

      {/* KPI Tiles Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fib-13">
        <WidgetBoundary name="kpi-active-tenants">
          <KPICard
            label="Total Active Tenants"
            value={tenants.length}
            delta="+2 this month"
            deltaDirection="up"
            accent="blue"
            icon={<Server className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-cluster-uptime">
          <KPICard
            label="Platform Uptime SLA"
            value="99.998%"
            delta="Nominal"
            deltaDirection="up"
            deltaLabel="Zero downtime in 90d"
            accent="green"
            icon={<Activity className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-api-throughput">
          <KPICard
            label="Total 24h API Throughput"
            value="456.0k req"
            delta="+18%"
            deltaDirection="up"
            accent="violet"
            icon={<Cpu className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-storage-utilization">
          <KPICard
            label="Encrypted Audio Storage"
            value="383 GB"
            subtext="AES-256 Vault"
            accent="neutral"
            icon={<HardDrive className="w-4 h-4" />}
          />
        </WidgetBoundary>
      </div>

      {/* System Alert Banner */}
      <div className="p-fib-13 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-950">
        <div className="flex items-center gap-fib-8">
          <ShieldAlert className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            <strong>Zero-Trust Authorization Matrix:</strong> All 7 application roles are enforced via cryptographic token scopes.
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold bg-white px-fib-8 py-0.5 rounded border border-blue-200">
          TLS 1.3 / AES-256
        </span>
      </div>

      {/* Tenants Table */}
      <WidgetBoundary name="tenants-cluster-table">
        <DataTable
          columns={columns}
          data={tenants}
          keyExtractor={(t) => t.id}
          searchPlaceholder="Search tenant organizations by name or ID..."
        />
      </WidgetBoundary>
    </div>
  );
}
