import { createBrowserRouter } from 'react-router-dom';
import { PageShell } from '@/layout/PageShell';
import { LoginPage } from '@/features/auth';
import { RoleRouteGuard } from '@/components/system/RoleRouteGuard';
import {
  SuperAdminDashboard,
  OrgAdminDashboard,
  SalesManagerDashboard,
  SalesRepDashboard,
  TelecallerDashboard,
  MarketingSDRDashboard,
  FinanceViewerDashboard,
} from '@/features/roles';
import { LeadsPage } from '@/features/leads';
import { DealsPage } from '@/features/deals';
import { CallsPage } from '@/features/calls';
import { InboxPage } from '@/features/inbox';
import { TasksPage } from '@/features/tasks';
import { ProposalsPage } from '@/features/proposals';
import { InvoicesPage } from '@/features/invoices';
import { ReportsPage } from '@/features/reports';
import { AICenterPage } from '@/features/ai';
import { AutomationPage } from '@/features/automation';
import { AdminPage } from '@/features/admin';

export const router = createBrowserRouter([

  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  /* Dedicated Production Role Dashboards Protected by RoleRouteGuard */
  {
    path: '/roles/super-admin',
    element: (
      <PageShell>
        <RoleRouteGuard allowedRoles={['SUPER_ADMIN']}>
          <SuperAdminDashboard />
        </RoleRouteGuard>
      </PageShell>
    ),
  },
  {
    path: '/roles/org-admin',
    element: (
      <PageShell>
        <RoleRouteGuard allowedRoles={['ORG_ADMIN', 'SUPER_ADMIN']}>
          <OrgAdminDashboard />
        </RoleRouteGuard>
      </PageShell>
    ),
  },
  {
    path: '/roles/sales-manager',
    element: (
      <PageShell>
        <RoleRouteGuard allowedRoles={['SALES_MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN']}>
          <SalesManagerDashboard />
        </RoleRouteGuard>
      </PageShell>
    ),
  },
  {
    path: '/roles/sales-rep',
    element: (
      <PageShell>
        <RoleRouteGuard allowedRoles={['SALES_REP', 'SALES_MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN']}>
          <SalesRepDashboard />
        </RoleRouteGuard>
      </PageShell>
    ),
  },
  {
    path: '/roles/telecaller',
    element: (
      <PageShell>
        <RoleRouteGuard allowedRoles={['TELECALLER', 'SALES_MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN']}>
          <TelecallerDashboard />
        </RoleRouteGuard>
      </PageShell>
    ),
  },
  {
    path: '/roles/marketing-sdr',
    element: (
      <PageShell>
        <RoleRouteGuard allowedRoles={['MARKETING_SDR', 'SALES_MANAGER', 'ORG_ADMIN', 'SUPER_ADMIN']}>
          <MarketingSDRDashboard />
        </RoleRouteGuard>
      </PageShell>
    ),
  },
  {
    path: '/roles/finance-viewer',
    element: (
      <PageShell>
        <RoleRouteGuard allowedRoles={['FINANCE_VIEWER', 'ORG_ADMIN', 'SUPER_ADMIN']}>
          <FinanceViewerDashboard />
        </RoleRouteGuard>
      </PageShell>
    ),
  },
  /* Core RevOps Feature Modules */
  {
    path: '/leads',
    element: (
      <PageShell>
        <LeadsPage />
      </PageShell>
    ),
  },
  {
    path: '/pipeline',
    element: (
      <PageShell>
        <DealsPage />
      </PageShell>
    ),
  },
  {
    path: '/calls',
    element: (
      <PageShell>
        <CallsPage />
      </PageShell>
    ),
  },
  {
    path: '/inbox',
    element: (
      <PageShell>
        <InboxPage />
      </PageShell>
    ),
  },
  {
    path: '/tasks',
    element: (
      <PageShell>
        <TasksPage />
      </PageShell>
    ),
  },
  {
    path: '/proposals',
    element: (
      <PageShell>
        <ProposalsPage />
      </PageShell>
    ),
  },
  {
    path: '/invoices',
    element: (
      <PageShell>
        <InvoicesPage />
      </PageShell>
    ),
  },
  {
    path: '/reports',
    element: (
      <PageShell>
        <ReportsPage />
      </PageShell>
    ),
  },
  {
    path: '/ai',
    element: (
      <PageShell>
        <AICenterPage />
      </PageShell>
    ),
  },
  {
    path: '/automation',
    element: (
      <PageShell>
        <AutomationPage />
      </PageShell>
    ),
  },
  {
    path: '/admin',
    element: (
      <PageShell>
        <AdminPage />
      </PageShell>
    ),
  },
  {
    path: '*',
    element: <LoginPage />,
  },
]);
