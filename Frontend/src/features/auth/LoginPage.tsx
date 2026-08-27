import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore, ROLE_DASHBOARDS } from '@/stores/sessionStore';
import { useUIStore } from '@/stores/uiStore';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  Layers,
  Sparkles,
  ShieldCheck,
  Lock,
  PhoneCall,
  ArrowRight,
  TrendingUp,
  Building2,
  Eye,
  EyeOff,
  UserCheck,
  KeyRound,
} from 'lucide-react';
import { authApi } from './api/authApi';
import { organizationsApi, TenantOrgDto } from '../admin/api/organizationsApi';

interface RoleOption {
  role: UserRole;
  label: string;
  description: string;
  badge: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'ORG_ADMIN',
    label: 'Organization Admin',
    description: 'Full workspace management, billing & team configuration',
    badge: 'Admin Access',
  },
  {
    role: 'SALES_REP',
    label: 'Sales Representative',
    description: 'Deals pipeline, active lead management & quote generation',
    badge: 'Pipeline',
  },
  {
    role: 'SALES_MANAGER',
    label: 'Sales Manager',
    description: 'Team performance, quota tracking & revenue forecasting',
    badge: 'Management',
  },
  {
    role: 'TELECALLER',
    label: 'Telecaller / Outreach Specialist',
    description: 'High-volume autodialing queue & call dispositioning',
    badge: 'Outreach',
  },
  {
    role: 'MARKETING_SDR',
    label: 'Marketing / SDR',
    description: 'Inbound lead qualification, enrichment & campaign analytics',
    badge: 'Inbound',
  },
  {
    role: 'FINANCE_VIEWER',
    label: 'Finance Viewer',
    description: 'Invoices, payment reconciliation & financial reports',
    badge: 'Finance',
  },
  {
    role: 'SUPER_ADMIN',
    label: 'Platform Super Admin',
    description: 'Multi-tenant root controls & infrastructure operations',
    badge: 'Root Clearance',
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const { user, isAuthenticated } = useSessionStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>('ORG_ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState('org_acme_corp');
  const [availableOrgs, setAvailableOrgs] = useState<TenantOrgDto[]>([
    { id: 'org_acme_corp', organizationId: 'org_acme_corp', name: 'Acme Enterprise Inc.', tier: 'ENTERPRISE_PLUS', activeUsers: 6, maxUsers: 50, storageGb: 148, apiCalls24h: 184500, health: 'HEALTHY', slaStatus: 'COMPLIANT' },
    { id: 'org_apex_global', organizationId: 'org_apex_global', name: 'Apex Capital Logistics', tier: 'ENTERPRISE', activeUsers: 4, maxUsers: 30, storageGb: 89, apiCalls24h: 92300, health: 'HEALTHY', slaStatus: 'COMPLIANT' },
  ]);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch live active tenant organizations
  useEffect(() => {
    organizationsApi.getOrganizations().then((orgs) => {
      if (Array.isArray(orgs) && orgs.length > 0) {
        setAvailableOrgs(orgs);
        if (!selectedOrg) {
          setSelectedOrg(orgs[0].organizationId || orgs[0].id);
        }
      }
    }).catch(() => {});
  }, []);

  // If already authenticated, redirect forward to user's dashboard and replace login in browser history
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROLE_DASHBOARDS[user.role] || '/leads', { replace: true });
    }
  }, [isAuthenticated, user.role, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      addToast({
        type: 'danger',
        title: 'Missing Fields',
        message: 'Please enter your work email and password.',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate credentials against the backend database
      const result = await authApi.login({
        email: email.trim(),
        password: password,
      });

      if (!result?.user) {
        throw new Error('Invalid authentication response from server.');
      }

      useSessionStore.getState().setUserSession({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role || selectedRole,
        organizationId: result.user.organizationId,
        organizationName: result.user.organizationName || selectedOrg,
      });

      addToast({
        type: 'success',
        title: `Welcome, ${result.user.name}!`,
        message: `Authenticated as ${result.user.role.replace(/_/g, ' ')}`,
      });

      navigate(ROLE_DASHBOARDS[result.user.role] || '/leads', { replace: true });
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      addToast({
        type: 'danger',
        title: 'Authentication Failed',
        message: err?.message || 'Invalid email or password. Please verify your credentials.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Bar */}
      <header className="h-16 bg-white border-b border-neutral-200 sticky top-0 z-30 px-6 sm:px-12 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-blue-600 to-blue-700 flex items-center justify-center text-white border border-blue-700 shadow-sm">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-neutral-900 block leading-tight">
              ADVMEN <span className="text-blue-600 font-bold">SalesOS</span>
            </span>
            <span className="text-[10px] text-neutral-500 font-mono block">
              Enterprise Revenue Operating System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auth Service Online</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Platform Value & System Capabilities */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Autonomous RevOps • Fault-Isolated Micro-Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
            Enterprise Sales Operations <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-600 bg-clip-text text-transparent">
              Built for Scale & Security
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 max-w-xl leading-relaxed">
            Unified revenue operating system with high-velocity lead pipelines, intelligent telephony autodialing, multi-tenant RBAC isolation, and end-to-end payment reconciliation.
          </p>

          {/* 3 Core Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm space-y-2 hover:shadow-md transition-all">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 w-fit">
                <PhoneCall className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-neutral-900">Telephony Engine</h4>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Autodialer with real-time call disposition and disposition metrics.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm space-y-2 hover:shadow-md transition-all">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 w-fit">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-neutral-900">Pipeline & CPQ</h4>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Kanban deal tracking, automated quotes, and invoice reconciliation.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm space-y-2 hover:shadow-md transition-all">
              <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200 w-fit">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-neutral-900">Zero-Trust RBAC</h4>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Cryptographically validated multi-tenant session isolation.
              </p>
            </div>
          </div>

          {/* Security & Compliance Highlights */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-neutral-800">Enterprise Grade Security</span>
            </div>
            <div className="flex items-center gap-5 text-neutral-500 font-mono text-[11px]">
              <span>JWT + HTTP-Only Cookies</span>
              <span>Multi-Tenant DB Scoping</span>
              <span>Audit Logged</span>
            </div>
          </div>
        </div>

        {/* Right Column: Standard Production Sign-In Card */}
        <div className="lg:col-span-5">
          <div className="bg-white text-neutral-900 rounded-2xl border border-neutral-200 p-6 sm:p-8 shadow-xl space-y-5 relative overflow-hidden">
            {/* Top Accent Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-700 to-emerald-500" />

            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                  Sign in to Workspace
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-mono">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Enter your credentials to access your organization portal.
              </p>
            </div>

            {/* Role / Portal Selection Custom Dropdown */}
            <div className="space-y-1.5">
              <Select
                label="Select Role / Portal Access"
                value={selectedRole}
                onChange={(val) => setSelectedRole(val as UserRole)}
                options={ROLE_OPTIONS.map((opt) => ({
                  value: opt.role,
                  label: opt.label,
                  description: opt.description,
                  badge: opt.badge,
                  icon: <UserCheck className="w-3.5 h-3.5 text-neutral-500" />,
                }))}
              />

              {selectedRole === 'SUPER_ADMIN' && (
                <div className="p-2.5 rounded-lg bg-violet-50 border border-violet-200 text-xs text-violet-900 flex items-center gap-2 mt-2 animate-in fade-in">
                  <Lock className="w-4 h-4 text-violet-700 shrink-0" />
                  <span className="text-[11px]">
                    <strong>Platform Super Admin:</strong> Access requires root administrative privileges.
                  </span>
                </div>
              )}
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="Work Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                rightElement={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />

              {/* Tenant Organization Workspace Custom Dropdown */}
              <div className="space-y-1">
                <Select
                  label="Tenant Organization Workspace"
                  value={selectedOrg}
                  onChange={(val) => setSelectedOrg(val)}
                  options={availableOrgs.map((org) => ({
                    value: org.organizationId || org.id,
                    label: org.name,
                    description: `ID: ${org.organizationId || org.id} • ${org.tier || 'ENTERPRISE'}`,
                    icon: <Building2 className="w-3.5 h-3.5 text-blue-600" />,
                  }))}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-neutral-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Remember this device</span>
                </label>
                <span className="text-blue-600 font-semibold text-xs cursor-pointer hover:underline">
                  Forgot password?
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center text-sm py-3 font-bold shadow-md hover:shadow-lg transition-all"
                isLoading={isLoading}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Sign In to Workspace
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 px-6 text-center text-xs text-neutral-500">
        <p>© 2026 ADVMEN SalesOS Inc. All rights reserved. Enterprise Revenue Operating System.</p>
      </footer>
    </div>
  );
}
