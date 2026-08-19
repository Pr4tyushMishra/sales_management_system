import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from './db.js';
import { OrganizationModel } from '../modules/organizations/organization.model.js';
import { UserModel } from '../modules/auth/auth.model.js';
import { LeadModel } from '../modules/leads/lead.model.js';
import { DealModel } from '../modules/deals/deal.model.js';
import { TaskModel } from '../modules/tasks/task.model.js';
import { AutomationModel } from '../modules/automations/automation.model.js';
import { USER_ROLES, ROLE_DEFAULT_PERMISSIONS } from './constants.js';
import { logger } from '../shared/logger/logger.js';

export async function seedDatabase(): Promise<void> {
  logger.info('🌱 Initializing Database Seeding & Production Records...');

  // 1. Seed Organizations
  const organizations = [
    {
      organizationId: 'org_advmen_platform',
      name: 'ADVMEN Platform Ops',
      slug: 'advmen-platform',
      planTier: 'ENTERPRISE',
      planStatus: 'ACTIVE',
      limits: {
        maxUsers: 100,
        maxLeads: 50000,
        maxStorageMb: 51200,
        aiTokensIncluded: 1000000,
      },
      settings: {
        timezone: 'UTC',
        currency: 'USD',
        leadResponseSlaMinutes: 15,
        allowTelephonyRecording: true,
      },
    },
    {
      organizationId: 'org_acme_corp',
      name: 'Acme Enterprise Inc.',
      slug: 'acme-corp',
      planTier: 'ENTERPRISE',
      planStatus: 'ACTIVE',
      limits: {
        maxUsers: 25,
        maxLeads: 10000,
        maxStorageMb: 10240,
        aiTokensIncluded: 250000,
      },
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        leadResponseSlaMinutes: 15,
        allowTelephonyRecording: true,
      },
    },
  ];

  for (const org of organizations) {
    await OrganizationModel.findOneAndUpdate(
      { organizationId: org.organizationId },
      { $set: org },
      { upsert: true, new: true }
    );
  }
  logger.info(`✅ Organizations initialized (${organizations.length} workspaces)`);

  // 2. Seed Real Users with Bcrypt Hashed Passwords
  const defaultPasswordHash = await bcrypt.hash('AdvmenSecurePassword2026!', 12);

  const users = [
    {
      organizationId: 'org_advmen_platform',
      name: 'Alexander Sterling',
      email: 'alexander@advmen.io',
      normalizedEmail: 'alexander@advmen.io',
      passwordHash: defaultPasswordHash,
      role: USER_ROLES.SUPER_ADMIN,
      permissions: ROLE_DEFAULT_PERMISSIONS[USER_ROLES.SUPER_ADMIN],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true,
    },
    {
      organizationId: 'org_acme_corp',
      name: 'Sarah Chen',
      email: 'sarah.c@acmecorp.com',
      normalizedEmail: 'sarah.c@acmecorp.com',
      passwordHash: defaultPasswordHash,
      role: USER_ROLES.ORG_ADMIN,
      permissions: ROLE_DEFAULT_PERMISSIONS[USER_ROLES.ORG_ADMIN],
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true,
    },
    {
      organizationId: 'org_acme_corp',
      name: 'Marcus Vance',
      email: 'marcus.v@acmecorp.com',
      normalizedEmail: 'marcus.v@acmecorp.com',
      passwordHash: defaultPasswordHash,
      role: USER_ROLES.SALES_MANAGER,
      permissions: ROLE_DEFAULT_PERMISSIONS[USER_ROLES.SALES_MANAGER],
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true,
    },
    {
      organizationId: 'org_acme_corp',
      name: 'Devon Patel',
      email: 'devon.p@acmecorp.com',
      normalizedEmail: 'devon.p@acmecorp.com',
      passwordHash: defaultPasswordHash,
      role: USER_ROLES.SALES_REP,
      permissions: ROLE_DEFAULT_PERMISSIONS[USER_ROLES.SALES_REP],
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true,
    },
    {
      organizationId: 'org_acme_corp',
      name: 'Elena Rostova',
      email: 'elena.r@acmecorp.com',
      normalizedEmail: 'elena.r@acmecorp.com',
      passwordHash: defaultPasswordHash,
      role: USER_ROLES.TELECALLER,
      permissions: ROLE_DEFAULT_PERMISSIONS[USER_ROLES.TELECALLER],
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true,
    },
    {
      organizationId: 'org_acme_corp',
      name: 'Jordan Miller',
      email: 'jordan.m@acmecorp.com',
      normalizedEmail: 'jordan.m@acmecorp.com',
      passwordHash: defaultPasswordHash,
      role: USER_ROLES.MARKETING_SDR,
      permissions: ROLE_DEFAULT_PERMISSIONS[USER_ROLES.MARKETING_SDR],
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true,
    },
    {
      organizationId: 'org_acme_corp',
      name: 'Victoria Cross',
      email: 'victoria.c@acmecorp.com',
      normalizedEmail: 'victoria.c@acmecorp.com',
      passwordHash: defaultPasswordHash,
      role: USER_ROLES.FINANCE_VIEWER,
      permissions: ROLE_DEFAULT_PERMISSIONS[USER_ROLES.FINANCE_VIEWER],
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      isEmailVerified: true,
    },
  ];

  for (const user of users) {
    await UserModel.findOneAndUpdate(
      { organizationId: user.organizationId, normalizedEmail: user.normalizedEmail },
      { $set: user },
      { upsert: true, new: true }
    );
  }
  logger.info(`✅ Users initialized (${users.length} authenticated enterprise roles)`);

  // 3. Seed Real Enterprise Leads
  const leads = [
    {
      leadId: 'lead_enterprise_01',
      organizationId: 'org_acme_corp',
      name: 'Dr. Evelyn Reed',
      title: 'Chief Medical Officer',
      company: 'Apex Health Systems',
      email: 'evelyn.reed@apexhealth.org',
      normalizedEmail: 'evelyn.reed@apexhealth.org',
      phone: '+1 (415) 892-3104',
      normalizedPhone: '+14158923104',
      status: 'QUALIFIED',
      source: 'WEBSITE',
      score: 94,
      scoreCategory: 'HOT',
      budget: 185000,
      requirement: 'Full Hospital RevOps & Patient Communication Automation',
      slaStatus: 'ON_TIME',
      assignedTo: { id: 'usr_rep_01', name: 'Devon Patel' },
      aiSummary: {
        overview: 'Tier-1 Healthcare Network seeking unified HIPAA-compliant RevOps infrastructure.',
        intentLevel: 'HIGH',
        suggestedAction: 'Deliver customized security & BAA schedule alongside enterprise pilot quote.',
        keyPoints: ['Board approval secured for Q3', 'Replacing 3 legacy billing communication tools'],
        isApproved: true,
      },
    },
    {
      leadId: 'lead_enterprise_02',
      organizationId: 'org_acme_corp',
      name: 'Christopher Vance',
      title: 'VP Engineering & Infrastructure',
      company: 'CloudMatrix Global',
      email: 'c.vance@cloudmatrix.io',
      normalizedEmail: 'c.vance@cloudmatrix.io',
      phone: '+1 (206) 554-8921',
      normalizedPhone: '+12065548921',
      status: 'CONTACTED',
      source: 'LINKEDIN',
      score: 82,
      scoreCategory: 'HOT',
      budget: 120000,
      requirement: 'Developer API integrations and multi-tenant webhook streaming',
      slaStatus: 'ON_TIME',
      assignedTo: { id: 'usr_rep_01', name: 'Devon Patel' },
      aiSummary: {
        overview: 'Cloud infrastructure provider expanding sales outreach team from 10 to 50 reps.',
        intentLevel: 'HIGH',
        suggestedAction: 'Coordinate technical discovery with Lead Solutions Architect.',
        keyPoints: ['Strong API-first evaluation criteria', '60-day migration timeline'],
        isApproved: false,
      },
    },
    {
      leadId: 'lead_enterprise_03',
      organizationId: 'org_acme_corp',
      name: 'Samantha Thorne',
      title: 'Director of Global Revenue Ops',
      company: 'Starlight Logistics',
      email: 's.thorne@starlight-logistics.com',
      normalizedEmail: 's.thorne@starlight-logistics.com',
      phone: '+1 (312) 774-9023',
      normalizedPhone: '+13127749023',
      status: 'NEW',
      source: 'INBOUND_CALL',
      score: 78,
      scoreCategory: 'WARM',
      budget: 95000,
      requirement: 'Automated telephony dialer queue and telecaller SLA monitoring',
      slaStatus: 'ON_TIME',
      assignedTo: { id: 'usr_sdr_01', name: 'Jordan Miller' },
      aiSummary: {
        overview: 'Mid-market freight brokerage seeking automated dispatch telephony and dialer sync.',
        intentLevel: 'MEDIUM',
        suggestedAction: 'Initiate call recording & real-time transcription demo.',
        keyPoints: ['High inbound call volume', 'Immediate dialer queue requirement'],
        isApproved: false,
      },
    },
    {
      leadId: 'lead_enterprise_04',
      organizationId: 'org_acme_corp',
      name: 'Gregory Paulson',
      title: 'Chief Financial Officer',
      company: 'Horizon Wealth Management',
      email: 'gregory@horizonwealth.com',
      normalizedEmail: 'gregory@horizonwealth.com',
      phone: '+1 (212) 993-4122',
      normalizedPhone: '+12129934122',
      status: 'QUALIFIED',
      source: 'REFERRAL',
      score: 88,
      scoreCategory: 'HOT',
      budget: 240000,
      requirement: 'Enterprise wealth client tracking, invoice automation, and proposal e-signatures',
      slaStatus: 'ON_TIME',
      assignedTo: { id: 'usr_rep_01', name: 'Devon Patel' },
      aiSummary: {
        overview: 'FINRA-compliant wealth firm looking for proposal generation and automated invoicing.',
        intentLevel: 'HIGH',
        suggestedAction: 'Prepare custom Master Services Agreement and enterprise SLA proposal.',
        keyPoints: ['CFO-level sponsor', 'Budget allocated for instant deployment'],
        isApproved: true,
      },
    },
    {
      leadId: 'lead_enterprise_05',
      organizationId: 'org_acme_corp',
      name: 'Maria Santos',
      title: 'Head of Growth Marketing',
      company: 'Vanguard Retail Digital',
      email: 'maria.s@vanguardretail.com',
      normalizedEmail: 'maria.s@vanguardretail.com',
      phone: '+1 (305) 441-8930',
      normalizedPhone: '+13054418930',
      status: 'CONTACTED',
      source: 'META_ADS',
      score: 65,
      scoreCategory: 'WARM',
      budget: 45000,
      requirement: 'Omnichannel lead capture and multi-campaign attribution',
      slaStatus: 'ON_TIME',
      assignedTo: { id: 'usr_tele_01', name: 'Elena Rostova' },
      aiSummary: {
        overview: 'E-commerce growth team analyzing conversion drop-off on paid landing pages.',
        intentLevel: 'MEDIUM',
        suggestedAction: 'Send automated case study on retail conversion optimization.',
        keyPoints: ['Marketing attribution focus', 'Self-serve trial request'],
        isApproved: false,
      },
    },
    {
      leadId: 'lead_enterprise_06',
      organizationId: 'org_acme_corp',
      name: 'Liam O’Connor',
      title: 'VP Procurement & Strategy',
      company: 'Nordic Oceanic Holdings',
      email: 'liam.o@nordicoceanic.eu',
      normalizedEmail: 'liam.o@nordicoceanic.eu',
      phone: '+44 20 7946 0912',
      normalizedPhone: '+442079460912',
      status: 'NEW',
      source: 'WEBSITE',
      score: 55,
      scoreCategory: 'COLD',
      budget: 35000,
      requirement: 'Initial RFP pricing request for Nordic subsidiaries',
      slaStatus: 'ON_TIME',
      assignedTo: { id: 'usr_sdr_01', name: 'Jordan Miller' },
      aiSummary: {
        overview: 'Early exploratory inquiry for multi-currency international billing support.',
        intentLevel: 'LOW',
        suggestedAction: 'Enroll in automated nurture sequence and follow up in 14 days.',
        keyPoints: ['RFP exploratory phase', 'Multi-currency requirement'],
        isApproved: false,
      },
    },
  ];

  for (const lead of leads) {
    await LeadModel.findOneAndUpdate(
      { organizationId: lead.organizationId, leadId: lead.leadId },
      { $set: lead },
      { upsert: true, new: true }
    );
  }
  logger.info(`✅ Leads initialized (${leads.length} enterprise prospects)`);

  // 4. Seed Real Active Deals (Kanban Pipeline)
  const deals = [
    {
      dealId: 'deal_apex_01',
      organizationId: 'org_acme_corp',
      title: 'Apex Health Systems Enterprise Rollout',
      company: 'Apex Health Systems',
      contactName: 'Dr. Evelyn Reed',
      contactEmail: 'evelyn.reed@apexhealth.org',
      value: 185000,
      currency: 'USD',
      stage: 'NEGOTIATION',
      pipelineId: 'default_pipeline',
      probability: 85,
      expectedCloseDate: new Date('2026-09-15'),
      health: 'HEALTHY',
      assignedTo: { id: 'usr_rep_01', name: 'Devon Patel' },
      transitions: [
        { fromStage: 'DISCOVERY', toStage: 'QUALIFICATION', actorId: 'usr_rep_01', transitionedAt: new Date(Date.now() - 86400000 * 10) },
        { fromStage: 'QUALIFICATION', toStage: 'PROPOSAL', actorId: 'usr_rep_01', transitionedAt: new Date(Date.now() - 86400000 * 5) },
        { fromStage: 'PROPOSAL', toStage: 'NEGOTIATION', actorId: 'usr_rep_01', transitionedAt: new Date(Date.now() - 86400000 * 2) },
      ],
    },
    {
      dealId: 'deal_horizon_02',
      organizationId: 'org_acme_corp',
      title: 'Horizon Wealth Management Global Platform',
      company: 'Horizon Wealth Management',
      contactName: 'Gregory Paulson',
      contactEmail: 'gregory@horizonwealth.com',
      value: 240000,
      currency: 'USD',
      stage: 'PROPOSAL',
      pipelineId: 'default_pipeline',
      probability: 70,
      expectedCloseDate: new Date('2026-09-30'),
      health: 'HEALTHY',
      assignedTo: { id: 'usr_rep_01', name: 'Devon Patel' },
      transitions: [
        { fromStage: 'DISCOVERY', toStage: 'QUALIFICATION', actorId: 'usr_rep_01', transitionedAt: new Date(Date.now() - 86400000 * 8) },
        { fromStage: 'QUALIFICATION', toStage: 'PROPOSAL', actorId: 'usr_rep_01', transitionedAt: new Date(Date.now() - 86400000 * 3) },
      ],
    },
    {
      dealId: 'deal_cloudmatrix_03',
      organizationId: 'org_acme_corp',
      title: 'CloudMatrix Infrastructure AE Expansion',
      company: 'CloudMatrix Global',
      contactName: 'Christopher Vance',
      contactEmail: 'c.vance@cloudmatrix.io',
      value: 120000,
      currency: 'USD',
      stage: 'QUALIFICATION',
      pipelineId: 'default_pipeline',
      probability: 50,
      expectedCloseDate: new Date('2026-10-15'),
      health: 'HEALTHY',
      assignedTo: { id: 'usr_rep_01', name: 'Devon Patel' },
      transitions: [
        { fromStage: 'DISCOVERY', toStage: 'QUALIFICATION', actorId: 'usr_rep_01', transitionedAt: new Date(Date.now() - 86400000 * 4) },
      ],
    },
    {
      dealId: 'deal_starlight_04',
      organizationId: 'org_acme_corp',
      title: 'Starlight Logistics Telephony Hub',
      company: 'Starlight Logistics',
      contactName: 'Samantha Thorne',
      contactEmail: 's.thorne@starlight-logistics.com',
      value: 95000,
      currency: 'USD',
      stage: 'DISCOVERY',
      pipelineId: 'default_pipeline',
      probability: 30,
      expectedCloseDate: new Date('2026-10-31'),
      health: 'HEALTHY',
      assignedTo: { id: 'usr_sdr_01', name: 'Jordan Miller' },
      transitions: [],
    },
    {
      dealId: 'deal_cybershield_05',
      organizationId: 'org_acme_corp',
      title: 'CyberShield 100-Seat Security Upsell',
      company: 'CyberShield Global',
      contactName: 'Rachel Green',
      contactEmail: 'rachel@cybershield.com',
      value: 60000,
      currency: 'USD',
      stage: 'WON',
      pipelineId: 'default_pipeline',
      probability: 100,
      expectedCloseDate: new Date('2026-08-01'),
      health: 'HEALTHY',
      assignedTo: { id: 'usr_rep_01', name: 'Devon Patel' },
      transitions: [
        { fromStage: 'NEGOTIATION', toStage: 'WON', actorId: 'usr_rep_01', transitionedAt: new Date(Date.now() - 86400000 * 15) },
      ],
    },
    {
      dealId: 'deal_nordic_06',
      organizationId: 'org_acme_corp',
      title: 'Nordic Oceanic Subsidiary Pilot',
      company: 'Nordic Oceanic Holdings',
      contactName: 'Liam O’Connor',
      contactEmail: 'liam.o@nordicoceanic.eu',
      value: 35000,
      currency: 'USD',
      stage: 'LOST',
      pipelineId: 'default_pipeline',
      probability: 0,
      lossReason: 'Deferred project to next fiscal year',
      expectedCloseDate: new Date('2026-07-20'),
      health: 'CRITICAL',
      assignedTo: { id: 'usr_sdr_01', name: 'Jordan Miller' },
      transitions: [
        { fromStage: 'DISCOVERY', toStage: 'LOST', actorId: 'usr_sdr_01', reason: 'Budget postponed', transitionedAt: new Date(Date.now() - 86400000 * 20) },
      ],
    },
  ];

  for (const deal of deals) {
    await DealModel.findOneAndUpdate(
      { organizationId: deal.organizationId, dealId: deal.dealId },
      { $set: deal },
      { upsert: true, new: true }
    );
  }
  logger.info(`✅ Deals initialized (${deals.length} active pipeline deals)`);

  // 5. Seed Tasks
  const tasks = [
    {
      taskId: 'task_01',
      organizationId: 'org_acme_corp',
      title: 'Send SOC2 Type II compliance packet to Dr. Evelyn Reed',
      relatedTo: { type: 'DEAL', id: 'deal_apex_01', name: 'Apex Health Systems Enterprise Rollout' },
      ownerId: 'usr_rep_01',
      assignedToName: 'Devon Patel',
      priority: 'URGENT',
      dueAt: new Date(Date.now() + 86400000 * 1),
      status: 'PENDING',
      isCompleted: false,
    },
    {
      taskId: 'task_02',
      organizationId: 'org_acme_corp',
      title: 'Confirm technical discovery call time with Christopher Vance',
      relatedTo: { type: 'LEAD', id: 'lead_enterprise_02', name: 'Christopher Vance' },
      ownerId: 'usr_rep_01',
      assignedToName: 'Devon Patel',
      priority: 'HIGH',
      dueAt: new Date(Date.now() + 86400000 * 2),
      status: 'PENDING',
      isCompleted: false,
    },
    {
      taskId: 'task_03',
      organizationId: 'org_acme_corp',
      title: 'Prepare Master Services Agreement draft for Horizon Wealth CFO',
      relatedTo: { type: 'DEAL', id: 'deal_horizon_02', name: 'Horizon Wealth Management Global Platform' },
      ownerId: 'usr_rep_01',
      assignedToName: 'Devon Patel',
      priority: 'HIGH',
      dueAt: new Date(Date.now() + 86400000 * 3),
      status: 'PENDING',
      isCompleted: false,
    },
    {
      taskId: 'task_04',
      organizationId: 'org_acme_corp',
      title: 'Audit West Coast inbound dialer queue performance',
      relatedTo: { type: 'ACCOUNT', id: 'org_acme_corp', name: 'Telephony Ops' },
      ownerId: 'usr_tele_01',
      assignedToName: 'Elena Rostova',
      priority: 'MEDIUM',
      dueAt: new Date(Date.now() + 86400000 * 4),
      status: 'COMPLETED',
      isCompleted: true,
      completedAt: new Date(),
    },
  ];

  for (const task of tasks) {
    await TaskModel.findOneAndUpdate(
      { organizationId: task.organizationId, taskId: task.taskId },
      { $set: task },
      { upsert: true, new: true }
    );
  }
  logger.info(`✅ Tasks initialized (${tasks.length} CRM action items)`);

  // 6. Seed Automations
  const automations = [
    {
      organizationId: 'org_acme_corp',
      name: 'High-Score Lead Auto-Assignment & AI Briefing',
      description: 'Automatically routes leads with AI intent score > 80 directly to Senior AE and generates executive summary.',
      trigger: 'lead.score_updated',
      conditions: [{ field: 'score', operator: 'GREATER_THAN', value: 80 }],
      actions: [
        { type: 'ASSIGN_OWNER', config: { ownerId: 'usr_rep_01' } },
        { type: 'TRIGGER_AI_SUMMARY', config: {} },
        { type: 'SEND_NOTIFICATION', config: { title: 'High-Priority Lead Detected', channel: 'IN_APP' } },
      ],
      isActive: true,
      executionCount: 142,
    },
    {
      organizationId: 'org_acme_corp',
      name: 'Stalled Deal SLA Breach Alert',
      description: 'Notifies sales management when a deal in Negotiation stage exceeds 5 days without activity.',
      trigger: 'deal.stage_changed',
      conditions: [{ field: 'stage', operator: 'EQUALS', value: 'NEGOTIATION' }],
      actions: [
        { type: 'CREATE_TASK', config: { title: 'Immediate Deal Review Required', priority: 'URGENT' } },
        { type: 'SEND_NOTIFICATION', config: { title: 'Negotiation SLA Alert', channel: 'IN_APP' } },
      ],
      isActive: true,
      executionCount: 28,
    },
  ];

  for (const auto of automations) {
    await AutomationModel.findOneAndUpdate(
      { organizationId: auto.organizationId, name: auto.name },
      { $set: auto },
      { upsert: true, new: true }
    );
  }
  logger.info(`✅ Automations initialized (${automations.length} active RevOps rules)`);

  logger.info('🎉 Database Seeding & Production Initialization Complete!');
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
