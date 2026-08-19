import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore, ROLE_DASHBOARDS } from '@/stores/sessionStore';
import { useUIStore } from '@/stores/uiStore';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import {
  Layers,
  Sparkles,
  ShieldCheck,
  Lock,
  PhoneCall,
  ArrowRight,
  TrendingUp,
  Building2,
  ChevronRight,
  DollarSign,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { authApi } from './api/authApi';

interface RolePreset {
  role: UserRole;
  name: string;
  email: string;
  title: string;
  avatarUrl: string;
  org: string;
  badge: string;
  badgeColor: string;
  topBorder: string;
  accentBg: string;
}

const PRESET_ACCOUNTS: RolePreset[] = [
  {
    role: 'ORG_ADMIN',
    name: 'Sarah Chen',
    email: 'sarah.c@acmecorp.com',
    title: 'VP Operations (Org Admin)',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    org: 'Acme Enterprise Inc.',
    badge: 'Full Suite',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    topBorder: 'border-t-blue-600',
    accentBg: 'hover:bg-blue-50/50',
  },
  {
    role: 'SALES_REP',
    name: 'Devon Patel',
    email: 'devon.p@acmecorp.com',
    title: 'Senior Account Executive',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    org: 'Acme Enterprise Inc.',
    badge: 'Pipeline & Deals',
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
    topBorder: 'border-t-green-500',
    accentBg: 'hover:bg-green-50/50',
  },
  {
    role: 'SALES_MANAGER',
    name: 'Marcus Vance',
    email: 'marcus.v@acmecorp.com',
    title: 'Director of Global Sales',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    org: 'Acme Enterprise Inc.',
    badge: 'Quotas & Team',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    topBorder: 'border-t-amber-500',
    accentBg: 'hover:bg-amber-50/50',
  },
  {
    role: 'TELECALLER',
    name: 'Elena Rostova',
    email: 'elena.r@acmecorp.com',
    title: 'High-Volume Outreach Specialist',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    org: 'Acme Enterprise Inc.',
    badge: 'Speed Queue',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    topBorder: 'border-t-rose-500',
    accentBg: 'hover:bg-rose-50/50',
  },
  {
    role: 'SUPER_ADMIN',
    name: 'Alexander Sterling',
    email: 'alexander@advmen.io',
    title: 'Platform Infrastructure Ops',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    org: 'ADVMEN Platform Ops',
    badge: 'Root Multi-Tenant',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
    topBorder: 'border-t-violet-600',
    accentBg: 'hover:bg-violet-50/50',
  },
  {
    role: 'MARKETING_SDR',
    name: 'Jordan Miller',
    email: 'jordan.m@acmecorp.com',
    title: 'Inbound SDR Lead',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    org: 'Acme Enterprise Inc.',
    badge: 'Inbound Routing',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    topBorder: 'border-t-indigo-500',
    accentBg: 'hover:bg-indigo-50/50',
  },
  {
    role: 'FINANCE_VIEWER',
    name: 'Victoria Cross',
    email: 'victoria.c@acmecorp.com',
    title: 'Financial Controller',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    org: 'Acme Enterprise Inc.',
    badge: 'Billing & AR',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    topBorder: 'border-t-teal-500',
    accentBg: 'hover:bg-teal-50/50',
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const { user, isAuthenticated } = useSessionStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<RolePreset>(PRESET_ACCOUNTS[0]);
  const [selectedOrg, setSelectedOrg] = useState('Acme Enterprise Inc.');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect forward to user's dashboard and replace login in browser history
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROLE_DASHBOARDS[user.role] || '/leads', { replace: true });
    }
  }, [isAuthenticated, user.role, navigate]);

  const handleSelectPreset = (preset: RolePreset) => {
    setSelectedPreset(preset);
    setEmail(preset.email);
    setPassword('AdvmenSecurePassword2026!');
    setSelectedOrg(preset.org);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Strictly authenticate credentials against the backend database
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
        role: result.user.role,
        organizationId: result.user.organizationId,
        organizationName: result.user.organizationName || selectedOrg,
      });

      addToast({
        type: 'success',
        title: `Welcome back, ${result.user.name}!`,
        message: `Signed in as ${result.user.role.replace(/_/g, ' ')}`,
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

  const handleDirectDemoLogin = async (preset: RolePreset) => {
    setIsLoading(true);
    try {
      const result = await authApi.login({
        email: preset.email,
        password: 'AdvmenSecurePassword2026!',
      });

      if (!result?.user) {
        throw new Error('Authentication failed.');
      }

      useSessionStore.getState().setUserSession({
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        organizationId: result.user.organizationId,
        organizationName: result.user.organizationName || preset.org,
      });

      addToast({
        type: 'success',
        title: `Logged in as ${preset.name}`,
        message: `Role: ${preset.role.replace(/_/g, ' ')}`,
      });

      navigate(ROLE_DASHBOARDS[preset.role] || '/leads', { replace: true });
    } catch (err: any) {
      addToast({
        type: 'danger',
        title: 'Sign In Failed',
        message: err?.message || 'Could not authenticate preset account with database.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Bar with Skeuomorphic Light Surface */}
      <header className="h-20 bg-white/95 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-30 px-fib-21 sm:px-fib-55 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-fib-13">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center text-white skeuo-raised-2 border border-blue-600 shadow-elevation-1">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-neutral-900 block">
              ADVMEN <span className="text-blue-600 font-bold">SalesOS</span>
            </span>
            <span className="text-[10px] text-neutral-500 font-mono block">
              Enterprise Revenue Operating System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-fib-13">
          <a
            href="#role-directory"
            className="text-xs font-semibold text-neutral-600 hover:text-blue-600 transition-colors hidden sm:block"
          >
            Role Directory
          </a>
          <button
            onClick={() => handleDirectDemoLogin(PRESET_ACCOUNTS[0])}
            className="skeuo-btn-primary px-fib-13 py-fib-8 rounded-md text-xs font-bold shadow-elevation-1"
          >
            1-Click Demo Launch
          </button>
        </div>
      </header>

      {/* Main Hero Container with Fibonacci 8:5 golden ratio column split */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-fib-13 sm:px-fib-21 py-fib-34 grid grid-cols-1 lg:grid-cols-12 gap-fib-34 items-center">
        {/* Left Column (7-8 cols): Core Value Proposition & Live Financial Metrics Preview */}
        <div className="lg:col-span-7 space-y-fib-21">
          {/* Subtle Pill Accent */}
          <div className="inline-flex items-center gap-fib-8 px-fib-13 py-fib-5 rounded-pill bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Autonomous RevOps • Sub-Second SLA Guardrails</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 leading-tight">
            Accelerate Revenue with <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 bg-clip-text text-transparent">
              Fault-Isolated Sales Intelligence
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 max-w-xl leading-relaxed">
            ADVMEN SalesOS combines high-velocity telecaller autodialing, automated WhatsApp pipeline
            engagement, real-time SLA breach alerting, and zero-trust role-based permissions.
          </p>

          {/* Fibonacci 3-Card Value Pillars with Skeuomorphic Raised Light Surface */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-fib-13 pt-fib-8">
            <div className="skeuo-raised-1 bg-white p-fib-13 rounded-lg border border-neutral-200 border-t-2 border-t-blue-500 space-y-fib-5 hover:shadow-elevation-2 transition-all">
              <div className="p-fib-5 rounded-md bg-blue-50 text-blue-600 border border-blue-200 w-fit">
                <PhoneCall className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-neutral-900">Telecaller Autodialer</h4>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Sub-second call queues with real-time AI sentiment analysis.
              </p>
            </div>

            <div className="skeuo-raised-1 bg-white p-fib-13 rounded-lg border border-neutral-200 border-t-2 border-t-green-500 space-y-fib-5 hover:shadow-elevation-2 transition-all">
              <div className="p-fib-5 rounded-md bg-green-50 text-green-600 border border-green-200 w-fit">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-neutral-900">Revenue Forecaster</h4>
              <p className="text-[11px] text-neutral-500 leading-snug">
                Live closed-won ROI metrics, CPQ quotes, and Stripe billing.
              </p>
            </div>

            <div className="skeuo-raised-1 bg-white p-fib-13 rounded-lg border border-neutral-200 border-t-2 border-t-neutral-500 space-y-fib-5 hover:shadow-elevation-2 transition-all">
              <div className="p-fib-5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200 w-fit">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-neutral-900">Zero-Trust RBAC</h4>
              <p className="text-[11px] text-neutral-500 leading-snug">
                7 dedicated role shells with server-driven permissions.
              </p>
            </div>
          </div>

          {/* Live Metric Banner with Tabular Numbers */}
          <div className="skeuo-raised-2 bg-gradient-to-r from-blue-50/80 via-white to-green-50/80 p-fib-13 rounded-lg border border-neutral-200 flex flex-wrap items-center justify-between gap-fib-13 text-xs">
            <div className="flex items-center gap-fib-8">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
              <span className="font-bold text-neutral-800">Production Ready Instance</span>
            </div>
            <div className="flex items-center gap-fib-21 text-neutral-600 font-mono text-[11px]">
              <span className="flex items-center gap-1 font-bold text-green-700">
                <DollarSign className="w-3 h-3" /> $1.2M+ Q3 Pipeline
              </span>
              <span>4.2m Avg Touch SLA</span>
              <span>99.99% SLA Uptime</span>
            </div>
          </div>
        </div>

        {/* Right Column (4-5 cols): Skeuomorphic Raised Sign-In Card */}
        <div className="lg:col-span-5">
          <div className="skeuo-raised-3 bg-white text-neutral-900 rounded-2xl border border-neutral-200 p-fib-21 sm:p-fib-34 shadow-elevation-3 space-y-fib-21 relative overflow-hidden">
            {/* Top Light Bevel Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-green-500" />

            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-fib-3">
                <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                  Sign in to SalesOS
                </h3>
                <span className="text-[10px] font-bold px-fib-8 py-0.5 rounded-pill bg-blue-100 text-blue-800 border border-blue-200 font-mono">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Choose a preset demo account or input your credentials.
              </p>
            </div>

            {/* Role Preset Selector Well */}
            <div className="space-y-fib-5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Quick Role Account Selection
              </label>
              <div className="skeuo-sunken p-fib-8 rounded-lg bg-neutral-100 border border-neutral-300 flex items-center justify-between gap-fib-8">
                <div className="flex items-center gap-fib-8 min-w-0">
                  <Avatar name={selectedPreset.name} src={selectedPreset.avatarUrl} size="sm" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-neutral-900 block truncate">
                      {selectedPreset.name}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono block truncate">
                      {selectedPreset.title}
                    </span>
                  </div>
                </div>

                <select
                  value={selectedPreset.role}
                  onChange={(e) => {
                    const found = PRESET_ACCOUNTS.find((p) => p.role === e.target.value);
                    if (found) handleSelectPreset(found);
                  }}
                  className="skeuo-raised-1 text-xs font-bold px-fib-8 py-1.5 rounded-md bg-white border border-neutral-300 text-blue-700 outline-none cursor-pointer"
                >
                  {PRESET_ACCOUNTS.map((p) => (
                    <option key={p.role} value={p.role}>
                      {p.role.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPreset.role === 'SUPER_ADMIN' && (
                <div className="p-fib-8 rounded-md bg-violet-50 border border-violet-200 text-xs text-violet-900 flex items-center gap-fib-8 animate-in fade-in">
                  <Lock className="w-4 h-4 text-violet-700 shrink-0" />
                  <span className="text-[11px]">
                    <strong>Root Infrastructure Clearance:</strong> Super Admin access requires active multi-tenant cryptographic session authorization.
                  </span>
                </div>
              )}
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-fib-13">
              <Input
                label="Work Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
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
                    className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 transition-colors focus:outline-none"
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

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-neutral-700">
                  Tenant Organization Workspace
                </label>
                <div className="relative">
                  <select
                    value={selectedOrg}
                    onChange={(e) => setSelectedOrg(e.target.value)}
                    className="w-full skeuo-sunken text-xs px-fib-13 py-fib-8 rounded-md bg-neutral-100 border border-neutral-300 text-neutral-900 outline-none cursor-pointer"
                  >
                    <option value="Acme Enterprise Inc.">Acme Enterprise Inc.</option>
                    <option value="Apex Capital Global">Apex Capital Global</option>
                    <option value="ADVMEN Platform Ops">ADVMEN Platform Ops</option>
                  </select>
                  <Building2 className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-fib-5 text-neutral-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Remember this device</span>
                </label>
                <a href="#role-directory" className="text-blue-600 font-semibold hover:underline">
                  SSO Directory
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center text-sm py-fib-13 font-bold shadow-elevation-2"
                isLoading={isLoading}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Sign In to Workspace
              </Button>
            </form>

            {/* Instant Demo Launch Button */}
            <div className="pt-fib-13 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => handleDirectDemoLogin(selectedPreset)}
                className="w-full skeuo-btn-success py-fib-8 rounded-md text-xs font-bold flex items-center justify-center gap-fib-8 shadow-elevation-1"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Single-Click Instant Enterprise Sign-In</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Role Directory Section with Fibonacci 4-Column Proportions */}
      <section
        id="role-directory"
        className="border-t border-neutral-200 bg-white py-fib-34 px-fib-13 sm:px-fib-21"
      >
        <div className="max-w-7xl mx-auto space-y-fib-21">
          <div className="flex flex-wrap items-center justify-between gap-fib-13">
            <div>
              <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                Enterprise Role Demo Directory
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Click any role card below to enter the CRM shell preconfigured with its respective zero-trust permissions.
              </p>
            </div>
            <span className="text-[11px] font-mono text-neutral-500 font-semibold">
              7 Dedicated Role Layouts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-fib-13">
            {PRESET_ACCOUNTS.map((preset) => (
              <div
                key={preset.role}
                onClick={() => handleDirectDemoLogin(preset)}
                className={cn(
                  'skeuo-raised-2 bg-white p-fib-13 rounded-xl border border-neutral-200 border-t-4 cursor-pointer transition-all duration-200 space-y-fib-13 group hover:shadow-elevation-3 hover:-translate-y-0.5',
                  preset.topBorder,
                  preset.accentBg
                )}
              >
                <div className="flex items-start justify-between gap-fib-8">
                  <Avatar name={preset.name} src={preset.avatarUrl} size="md" status="online" />
                  <span
                    className={cn(
                      'text-[10px] font-bold px-fib-8 py-0.5 rounded-pill border uppercase font-mono',
                      preset.badgeColor
                    )}
                  >
                    {preset.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                    {preset.name}
                  </h4>
                  <span className="text-xs text-neutral-600 font-medium block truncate">
                    {preset.title}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono block mt-0.5">
                    {preset.email}
                  </span>
                </div>

                <div className="pt-fib-8 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <span className="font-mono text-[10px] uppercase font-bold text-neutral-700">
                    {preset.role.replace('_', ' ')}
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                    Enter <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-100 py-fib-13 px-fib-21 text-center text-xs text-neutral-500">
        <p>© 2026 ADVMEN SalesOS Inc. All rights reserved. Enterprise Revenue Operating System.</p>
      </footer>
    </div>
  );
}
