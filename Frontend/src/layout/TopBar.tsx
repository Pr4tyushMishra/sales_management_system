import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore, ROLE_DASHBOARDS } from '@/stores/sessionStore';
import { useUIStore } from '@/stores/uiStore';

import { UserProfileDrawer } from '@/components/patterns/UserProfileDrawer';
import {
  Search,
  Bell,
  Building2,
  ChevronDown,
  Sparkles,
  Menu,
  AlertTriangle,
  LogOut,
  User,
  ExternalLink,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';

export function TopBar() {
  const { user, switchOrganization, logout } = useSessionStore();
  const { setCommandBarOpen, setMobileSidebarOpen, addToast } = useUIStore();
  const navigate = useNavigate();
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  const organizations = [
    { id: 'org_acme_corp', name: 'Acme Enterprise Inc.' },
    { id: 'org_apex_global', name: 'Apex Capital Global' },
    { id: 'org_nordic_tech', name: 'Nordic AI Technologies' },
  ];

  const handleLogout = async () => {
    // store.logout() calls authApi.logout() internally — calling it directly here too
    // caused a double-request: the 2nd hit had no session → 401 → refresh → 422 cascade.
    logout();
    addToast({ type: 'info', title: 'Logged out successfully', message: 'Returning to login portal.' });
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 sticky top-0 z-30 flex items-center justify-between px-fib-13 sm:px-fib-21 shadow-sm">
      {/* Left: Mobile menu toggle + Org switcher */}
      <div className="flex items-center gap-fib-8">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-600 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Tenant Organization Switcher */}
        <div className="relative">
          <button
            onClick={() => setOrgMenuOpen(!orgMenuOpen)}
            className="skeuo-btn-secondary flex items-center gap-fib-8 px-fib-13 py-fib-5 rounded-md text-xs font-semibold text-neutral-800"
          >
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="max-w-[140px] sm:max-w-[200px] truncate">{user.organizationName || 'Acme Enterprise Inc.'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          </button>

          {orgMenuOpen && (
            <>
              <div
                onClick={() => setOrgMenuOpen(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute left-0 mt-1.5 w-60 skeuo-raised-3 bg-white rounded-md border border-neutral-200 p-fib-5 z-50 shadow-xl space-y-fib-3">
                <span className="px-fib-8 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Active Tenant Workspace
                </span>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchOrganization(org.id, org.name);
                      setOrgMenuOpen(false);
                      addToast({
                        type: 'info',
                        title: 'Tenant Switched',
                        message: `Active workspace: ${org.name}`,
                      });
                    }}
                    className={cn(
                      'w-full text-left px-fib-8 py-fib-5 rounded-md text-xs flex items-center justify-between font-medium transition-colors',
                      user.organizationId === org.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    )}
                  >
                    <span>{org.name}</span>
                    {user.organizationId === org.id && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                        ACTIVE
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-fib-21">
        <button
          onClick={() => setCommandBarOpen(true)}
          className="w-full flex items-center justify-between px-fib-13 py-fib-5 rounded-md bg-neutral-100 border border-neutral-200 text-neutral-400 text-xs hover:border-neutral-300 transition-colors shadow-inner"
        >
          <div className="flex items-center gap-fib-8">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span>Search deals, prospects, or commands...</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-neutral-500 shadow-sm">
            <span>⌘</span>
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right: Actions, Notifications & User Avatar Dropdown */}
      <div className="flex items-center gap-fib-8">
        {/* Quick Global Command Trigger (Mobile) */}
        <button
          onClick={() => setCommandBarOpen(true)}
          className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600 md:hidden"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Real-Time Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors relative"
            title="SLA Alerts & Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          {notificationsOpen && (
            <>
              <div onClick={() => setNotificationsOpen(false)} className="fixed inset-0 z-40" />
              <div className="absolute right-0 mt-1.5 w-80 skeuo-raised-3 bg-white rounded-md border border-neutral-200 p-fib-13 z-50 shadow-xl space-y-fib-8">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-fib-5">
                  <span className="text-xs font-bold text-neutral-900">SLA Breach Alerts</span>
                  <span className="text-[10px] px-fib-5 py-0.2 bg-rose-100 text-rose-700 rounded font-bold">1 Urgent</span>
                </div>
                <div className="p-fib-8 rounded bg-rose-50 border border-rose-200 text-xs space-y-fib-3">
                  <div className="flex items-center gap-fib-5 text-rose-800 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>Apex Capital SLA Risk</span>
                  </div>
                  <p className="text-[11px] text-rose-700">Follow-up callback due in 45m before SLA violation occurs.</p>
                </div>
                <div className="p-fib-8 rounded bg-violet-50 border border-violet-200 text-xs space-y-fib-3">
                  <div className="flex items-center gap-fib-5 text-violet-800 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                    <span>AI Lead Scoring Update</span>
                  </div>
                  <p className="text-[11px] text-violet-700">Sarah Jenkins intent upgraded to Hot (94 Score).</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Avatar + Interactive Dropdown Menu */}
        <div className="relative pl-fib-5 border-l border-neutral-200">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-neutral-100 transition-colors focus:outline-none cursor-pointer"
            title="User Profile & Settings"
            aria-expanded={userMenuOpen}
          >
            <Avatar name={user.name} src={user.avatarUrl} size="sm" status="online" />
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <>
              <div onClick={() => setUserMenuOpen(false)} className="fixed inset-0 z-40" />
              <div className="absolute right-0 mt-2 w-64 skeuo-raised-3 bg-white rounded-xl border border-neutral-200 p-2 z-50 shadow-2xl space-y-1 animate-in fade-in zoom-in-95">
                {/* User Summary Header */}
                <div className="p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 space-y-1">
                  <p className="text-xs font-extrabold text-neutral-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate font-mono">
                    {user.email}
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {user.role.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                </div>

                <div className="h-px bg-neutral-100 my-1" />

                {/* Option 1: View Profile & Clearances */}
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    setProfileDrawerOpen(true);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4 text-neutral-500" />
                  <span>View Full Profile & Permissions</span>
                </button>

                {/* Option 2: My Authorized Hub */}
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate(ROLE_DASHBOARDS[user.role] || '/leads');
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 flex items-center gap-2.5 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-neutral-500" />
                  <span>Go to My Role Dashboard</span>
                </button>

                <div className="h-px bg-neutral-100 my-1" />

                {/* Option 3: Sign Out */}
                <button
                  onClick={async () => {
                    setUserMenuOpen(false);
                    await handleLogout();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out of Workspace</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Profile Detail Drawer */}
      <UserProfileDrawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
    </header>
  );
}
