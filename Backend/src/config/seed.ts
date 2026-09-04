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

export async function seedDatabase(forceClean: boolean = false): Promise<void> {
  logger.info('🌱 Verifying Platform Database & Super Admin Setup...');

  // Only purge when explicitly requested via CLI with forceClean flag
  if (forceClean) {
    logger.info('🧹 forceClean requested: purging mock records...');
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
      UserModel.deleteMany({ role: { $ne: USER_ROLES.SUPER_ADMIN } }),
    ]);
    logger.info(
      `🧹 Cleared records: ${leadsRes.deletedCount} leads, ${dealsRes.deletedCount} deals, ${tasksRes.deletedCount} tasks, ${orgsRes.deletedCount} orgs, ${usersRes.deletedCount} users.`
    );
  }

  // 1. Initialize / Upsert Platform Operations Root Workspace
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
  logger.info(`✅ Root platform workspace ready (${platformOrg.name})`);

  // 2. Provision / Upsert Sole Super Admin Account (from Environment Variables)
  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || env.SUPER_ADMIN_EMAIL || '').toLowerCase().trim();
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || env.SUPER_ADMIN_PASSWORD || '';

  if (superAdminEmail && superAdminPassword) {
    const superAdminPasswordHash = await bcrypt.hash(superAdminPassword, 12);

    // Clean up any other super admin or legacy accounts to ensure only the designated super admin exists
    await UserModel.deleteMany({
      role: USER_ROLES.SUPER_ADMIN,
      normalizedEmail: { $ne: superAdminEmail },
    });

    const existing = await UserModel.findOne({ normalizedEmail: superAdminEmail });
    if (!existing) {
      await UserModel.create({
        organizationId: 'org_advmen_platform',
        name: 'Super Administrator',
        email: superAdminEmail,
        normalizedEmail: superAdminEmail,
        passwordHash: superAdminPasswordHash,
        role: USER_ROLES.SUPER_ADMIN,
        permissions: ROLE_DEFAULT_PERMISSIONS[USER_ROLES.SUPER_ADMIN],
        avatarUrl: '',
        isActive: true,
        isEmailVerified: true,
      });
      logger.info(`👑 Sole Super Admin provisioned from environment: ${superAdminEmail}`);
    } else {
      existing.passwordHash = superAdminPasswordHash;
      existing.role = USER_ROLES.SUPER_ADMIN;
      existing.permissions = ROLE_DEFAULT_PERMISSIONS[USER_ROLES.SUPER_ADMIN];
      existing.isActive = true;
      existing.isEmailVerified = true;
      await existing.save();
      logger.info(`👑 Sole Super Admin credentials refreshed from environment: ${superAdminEmail}`);
    }
  } else {
    logger.info('ℹ️ SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD not set in environment; skipping super admin upsert.');
  }

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
