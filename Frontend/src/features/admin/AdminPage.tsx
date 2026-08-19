import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { KPICard } from '@/components/patterns/KPICard';
import { WidgetBoundary } from '@/components/system/WidgetBoundary';
import { Avatar } from '@/components/ui/Avatar';
import { useUIStore } from '@/stores/uiStore';
import { UserRole } from '@/types';
import {
  Users,
  Shield,
  HardDrive,
  Key,
  UserCheck,
  Plus,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface TeamMember {
  name: string;
  role: UserRole;
  email: string;
  seats: string;
  avatarUrl?: string;
  department?: string;
}

const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  { name: 'Sarah Chen', role: 'ORG_ADMIN', email: 'sarah.c@acmecorp.com', seats: 'Active', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', department: 'Executive Ops' },
  { name: 'Marcus Vance', role: 'SALES_MANAGER', email: 'marcus.v@acmecorp.com', seats: 'Active', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', department: 'Global Sales' },
  { name: 'Devon Patel', role: 'SALES_REP', email: 'devon.p@acmecorp.com', seats: 'Active', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', department: 'Mid-Market Sales' },
  { name: 'Elena Rostova', role: 'TELECALLER', email: 'elena.r@acmecorp.com', seats: 'Active', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', department: 'Outreach & Telephony' },
  { name: 'Jordan Miller', role: 'MARKETING_SDR', email: 'jordan.m@acmecorp.com', seats: 'Active', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', department: 'Inbound Demand' },
  { name: 'Victoria Cross', role: 'FINANCE_VIEWER', email: 'victoria.c@acmecorp.com', seats: 'Active', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', department: 'Finance & Billing' },
];

const AVAILABLE_ROLES: { role: UserRole; label: string; description: string }[] = [
  { role: 'SALES_REP', label: 'Sales Representative', description: 'Access to Deals pipeline, Leads, and Quotes' },
  { role: 'TELECALLER', label: 'Telecaller / Outreach', description: 'Dialer queue, contact list, and call disposition metrics' },
  { role: 'SALES_MANAGER', label: 'Sales Manager', description: 'Team leaderboards, quota approvals, and pipeline insights' },
  { role: 'MARKETING_SDR', label: 'Marketing / Inbound SDR', description: 'Inbound lead enrichment, campaign capture & scoring' },
  { role: 'FINANCE_VIEWER', label: 'Finance Viewer', description: 'Read-only access to invoices, payments, and financial analytics' },
  { role: 'ORG_ADMIN', label: 'Organization Admin', description: 'Full workspace administration, role assignment & billing' },
];

export function AdminPage() {
  const { addToast } = useUIStore();
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Strictly lock background body and html scrolling when modal is open
  useEffect(() => {
    if (isInviteOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isInviteOpen]);

  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('SALES_REP');
  const [newPassword, setNewPassword] = useState('SalesOS2026!Secure');
  const [department, setDepartment] = useState('Sales Operations');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let pass = 'Advmen';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '!';
    setNewPassword(pass);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      addToast({
        type: 'danger',
        title: 'Missing Details',
        message: 'Please provide both a full name and work email address.',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newMember: TeamMember = {
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        role: newRole,
        seats: 'Active',
        department: department.trim() || 'General Sales',
      };

      setMembers((prev) => [newMember, ...prev]);
      setIsSubmitting(false);
      setIsInviteOpen(false);

      // Reset form
      setNewName('');
      setNewEmail('');
      setNewRole('SALES_REP');
      setNewPassword('SalesOS2026!Secure');

      addToast({
        type: 'success',
        title: `Team Member Provisioned!`,
        message: `Successfully created ${newRole.replace(/_/g, ' ')} account for ${newMember.name} (${newMember.email}).`,
      });
    }, 400);
  };

  return (
    <div className="space-y-fib-21">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-fib-13 pb-fib-8 border-b border-neutral-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Organization Admin & Seat Provisioning
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Role-based access control, team member provisioning, API credentials, and tenant parameters.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsInviteOpen(true)}
        >
          Add Team Member
        </Button>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fib-13">
        <WidgetBoundary name="kpi-seat-usage">
          <KPICard
            label="Active Seats Utilized"
            value={`${members.length} / 50`}
            delta={`${50 - members.length} Available`}
            deltaDirection="up"
            accent="blue"
            icon={<Users className="w-4 h-4" />}
          />
        </WidgetBoundary>

        <WidgetBoundary name="kpi-role-types">
          <KPICard
            label="Configured Roles"
            value="7 Roles"
            subtext="Zero-trust RBAC matrix"
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
        <div className="skeuo-raised-2 bg-white rounded-md border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-fib-13 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Tenant User Roster & Role Assignments
              </h3>
              <p className="text-[11px] text-neutral-500">
                Active seats with cryptographic tenant isolation and assigned permission gates.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-neutral-600 font-mono bg-white px-2.5 py-1 rounded border border-neutral-200">
              {members.length} Enrolled Users
            </span>
          </div>

          <div className="divide-y divide-neutral-100">
            {members.map((m, i) => (
              <div
                key={i}
                className="p-fib-13 flex flex-wrap items-center justify-between gap-fib-13 hover:bg-neutral-50/80 transition-colors text-xs"
              >
                <div className="flex items-center gap-3 min-w-[220px]">
                  <Avatar name={m.name} src={m.avatarUrl} size="md" status="online" />
                  <div>
                    <span className="font-bold text-neutral-900 block">{m.name}</span>
                    <span className="text-[11px] text-neutral-500 font-mono">{m.email}</span>
                  </div>
                </div>

                <div className="text-neutral-500 text-[11px] hidden md:block">
                  <span className="font-medium text-neutral-700">{m.department || 'Operations'}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                    {m.role.replace(/_/g, ' ')}
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

      {/* Interactive Provision / Invite Team Member Modal */}
      {isInviteOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsInviteOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Provision New Team Member</h3>
                  <p className="text-xs text-neutral-500">Assign role permissions and generate credentials.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <Input
                label="Full Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Alex Henderson"
                required
              />

              <Input
                label="Work Email Address"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. alex.h@acmecorp.com"
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700">
                  Role & Permission Scope
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-lg bg-neutral-50 border border-neutral-300 text-neutral-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none cursor-pointer"
                >
                  {AVAILABLE_ROLES.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label} ({r.role})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-neutral-500">
                  {AVAILABLE_ROLES.find((r) => r.role === newRole)?.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Inbound Sales"
                />

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-neutral-700">
                      Temporary Password
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Sparkles className="w-2.5 h-2.5" /> Auto-Generate
                    </button>
                  </div>
                  <Input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter temporary password"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[11px] leading-relaxed">
                  <p className="font-semibold text-blue-900">Immediate Seat Provisioning</p>
                  <p className="text-blue-800">
                    The user will be immediately authorized to sign in with this email and temporary password to access their role dashboard.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  icon={<UserCheck className="w-4 h-4" />}
                >
                  Create & Enroll Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
