import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from './db.js';
import { OrganizationModel } from '../modules/organizations/organization.model.js';
import { UserModel } from '../modules/auth/auth.model.js';
import { LeadModel } from '../modules/leads/lead.model.js';
import { DealModel } from '../modules/deals/deal.model.js';
import { TaskModel } from '../modules/tasks/task.model.js';
import { AutomationModel } from '../modules/automations/automation.model.js';
import { ProposalModel } from '../modules/proposals/proposal.model.js';
import { InvoiceModel } from '../modules/invoices-payments/invoice.model.js';
import { CallModel } from '../modules/calls/call.model.js';
import { ActivityModel } from '../modules/activities/activity.model.js';
import { USER_ROLES, ROLE_DEFAULT_PERMISSIONS } from './constants.js';
import { logger } from '../shared/logger/logger.js';

export async function seedDatabase(): Promise<void> {
  logger.info('🌱 Initializing Clean Production Database & Super Admin Setup...');

  // 1. Purge legacy mock/demo data across collections
  const [leadsRes, dealsRes, tasksRes, autoRes, propRes, invRes, callRes, actRes, orgsRes, usersRes] = await Promise.all([
    LeadModel.deleteMany({}),
    DealModel.deleteMany({}),
    TaskModel.deleteMany({}),
    AutomationModel.deleteMany({}),
    ProposalModel.deleteMany({}),
    InvoiceModel.deleteMany({}),
    CallModel.deleteMany({}),
    ActivityModel.deleteMany({}),
    OrganizationModel.deleteMany({ organizationId: { $ne: 'org_advmen_platform' } }),
    UserModel.deleteMany({ email: { $ne: 'dwivediankit768@gmail.com' } }),
  ]);
  logger.info(
    `🧹 Cleared mock records: ${leadsRes.deletedCount} leads, ${dealsRes.deletedCount} deals, ${tasksRes.deletedCount} tasks, ${orgsRes.deletedCount} mock orgs, ${usersRes.deletedCount} mock users.`
  );

  // 2. Initialize Platform Operations Root Workspace
  const platformOrg = {
    organizationId: 'org_advmen_platform',
    name: 'ADVMEN Platform Ops',
    slug: 'advmen-platform',
    planTier: 'ENTERPRISE',
    planStatus: 'ACTIVE',
    limits: {
      maxUsers: 500,
      maxLeads: 1000000,
      maxStorageMb: 102400,
      aiTokensIncluded: 5000000,
    },
    settings: {
      timezone: 'UTC',
      currency: 'USD',
      leadResponseSlaMinutes: 15,
      allowTelephonyRecording: true,
    },
  };

  await OrganizationModel.findOneAndUpdate(
    { organizationId: platformOrg.organizationId },
    { $set: platformOrg },
    { upsert: true, new: true }
  );
  logger.info(`✅ Root platform workspace initialized (${platformOrg.name})`);

  // 3. Provision Super Admin Account
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@advmen.io';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || '@TOO323834d';
  const superAdminPasswordHash = await bcrypt.hash(superAdminPassword, 12);

  const superAdminUser = {
    organizationId: 'org_advmen_platform',
    name: 'Ankit Dwivedi',
    email: superAdminEmail,
    normalizedEmail: superAdminEmail.toLowerCase(),
    passwordHash: superAdminPasswordHash,
    role: USER_ROLES.SUPER_ADMIN,
    permissions: ROLE_DEFAULT_PERMISSIONS[USER_ROLES.SUPER_ADMIN],
    avatarUrl: '',
    isActive: true,
    isEmailVerified: true,
  };

  await UserModel.findOneAndUpdate(
    { normalizedEmail: superAdminUser.normalizedEmail },
    { $set: superAdminUser },
    { upsert: true, new: true }
  );
  logger.info(`👑 Super Admin provisioned: ${superAdminEmail} with full platform clearance.`);

  logger.info('🎉 Production database ready.');
}

// Support direct execution via CLI `npm run seed`
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      logger.error('❌ Seeding failed:', err);
      process.exit(1);
    }
  })();
}
