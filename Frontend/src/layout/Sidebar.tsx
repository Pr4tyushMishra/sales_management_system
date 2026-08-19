import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/utils/cn';
import {
  LayoutDashboard,
  Users,
  Kanban,
  PhoneCall,
  Inbox,
  CheckSquare,
  FileText,
  CreditCard,
  BarChart3,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers,
  Zap,
} from 'lucide-react';
import { ROLE_DASHBOARDS } from '@/stores/sessionStore';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  permission?: string;
  badge?: string;
}

export function Sidebar() {
  const { user } = useSessionStore();
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const location = useLocation();

  const userRoleDashboardPath = ROLE_DASHBOARDS[user.role] || '/leads';

  const navigationItems: NavItem[] = [
    { label: `${user.role.replace('_', ' ')} Hub`, path: userRoleDashboardPath, icon: <LayoutDashboard className="w-4 h-4" />, badge: 'Role' },
    { label: 'Leads & Prospects', path: '/leads', icon: <Users className="w-4 h-4" />, permission: 'lead.view', badge: '5' },
    { label: 'Deals & Pipeline', path: '/pipeline', icon: <Kanban className="w-4 h-4" />, permission: 'deal.view' },
    { label: 'Telecaller Queue', path: '/calls', icon: <PhoneCall className="w-4 h-4" />, permission: 'call.view', badge: 'Live' },
    { label: 'Unified Inbox', path: '/inbox', icon: <Inbox className="w-4 h-4" />, permission: 'inbox.view', badge: '1' },
    { label: 'Tasks & Activities', path: '/tasks', icon: <CheckSquare className="w-4 h-4" />, permission: 'task.manage' },
    { label: 'Proposals', path: '/proposals', icon: <FileText className="w-4 h-4" />, permission: 'proposal.create' },
    { label: 'Invoices & Billing', path: '/invoices', icon: <CreditCard className="w-4 h-4" />, permission: 'invoice.view' },
    { label: 'Reports & Analytics', path: '/reports', icon: <BarChart3 className="w-4 h-4" />, permission: 'reports.view' },
    { label: 'AI Intelligence Center', path: '/ai', icon: <Sparkles className="w-4 h-4" />, permission: 'ai.use', badge: 'AI' },
    { label: 'Automation Builder', path: '/automation', icon: <Zap className="w-4 h-4" />, permission: 'org.manage' },
    { label: 'Admin & Settings', path: '/admin', icon: <Settings className="w-4 h-4" />, permission: 'settings.manage' },
  ];

  // Strictly filter by server-driven permissions
  const filteredNavItems = navigationItems.filter(
    (item) => !item.permission || user.permissions.includes(item.permission)
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 bg-neutral-900 border-r border-neutral-800 text-neutral-300 flex flex-col transition-all duration-300 ease-in-out select-none shadow-xl',
          sidebarCollapsed ? 'w-[72px]' : 'w-[264px]',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-fib-13 border-b border-neutral-800/80 bg-neutral-900/90">
          <div className="flex items-center gap-fib-8 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-elevation-1 border border-blue-400/30 shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <span className="font-extrabold text-sm tracking-tight text-white block truncate">
                  ADVMEN <span className="text-blue-400 font-semibold">SalesOS</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-mono block truncate">
                  Enterprise RevOps
                </span>
              </div>
            )}
          </div>

          {!sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors hidden lg:flex"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Link List */}
        <nav className="flex-1 overflow-y-auto px-fib-8 py-fib-13 space-y-fib-5">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                title={sidebarCollapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-fib-8 px-fib-13 py-fib-8 rounded-md text-xs font-medium transition-all duration-150 relative group',
                  isActive
                    ? 'bg-blue-600/90 text-white font-semibold shadow-elevation-1 border border-blue-500/50'
                    : 'text-neutral-400 hover:bg-neutral-800/80 hover:text-white'
                )}
              >
                <div className={cn('shrink-0', isActive ? 'text-white' : 'text-neutral-400 group-hover:text-blue-400')}>
                  {item.icon}
                </div>

                {!sidebarCollapsed && (
                  <span className="truncate flex-1 tracking-tight">{item.label}</span>
                )}

                {!sidebarCollapsed && item.badge && (
                  <span
                    className={cn(
                      'px-fib-5 py-0.2 rounded-pill text-[10px] font-bold uppercase tracking-wider',
                      item.badge === 'Live'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                        : item.badge === 'AI'
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapsed Expand Toggle */}
        {sidebarCollapsed && (
          <div className="p-fib-8 border-t border-neutral-800 flex justify-center hidden lg:flex">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Current Tenant Footer */}
        <div className="p-fib-13 border-t border-neutral-800/80 bg-neutral-950/60">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-fib-8 text-xs">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <div className="min-w-0">
                <span className="text-[11px] font-semibold text-neutral-200 block truncate">
                  {user.organizationName}
                </span>
                <span className="text-[10px] text-neutral-500 block truncate font-mono">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title={`${user.organizationName} (${user.role})`}>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-neutral-800" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
