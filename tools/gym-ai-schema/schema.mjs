import {sql} from 'drizzle-orm';
import {check,integer,primaryKey,sqliteTable,text} from 'drizzle-orm/sqlite-core';

// Preview-only accounting. This table contains no gym queries or app records.
export const gymAiTrials=sqliteTable('menei_gym_ai_trials',{
 id:text('id').primaryKey(),
 used:integer('used').notNull().default(0),
 leaseId:text('lease_id'),
 leaseUntil:integer('lease_until').notNull().default(0),
 nextAllowedAt:integer('next_allowed_at').notNull().default(0)
});

// A fixed campaign; its first owner enrollment creates the permanent latch.
export const betaCampaigns=sqliteTable('menei_beta_campaigns',{
 id:text('id').primaryKey(),
 ownerUserId:text('owner_user_id').notNull(),
 bootstrapClosed:integer('bootstrap_closed').notNull(),
 createdAt:integer('created_at').notNull(),
 leaseId:text('lease_id'),
 leaseUntil:integer('lease_until').notNull().default(0),
 nextAllowedAt:integer('next_allowed_at').notNull().default(0)
},table=>[
 check('menei_beta_campaign_fixed',sql`${table.id} = 'menei-beta-20-1' AND ${table.bootstrapClosed} = 1`),
 check('menei_beta_campaign_time',sql`typeof(${table.createdAt}) = 'integer' AND ${table.createdAt} >= 0`)
]);

export const betaMembers=sqliteTable('menei_beta_members',{
 campaignId:text('campaign_id').notNull(),
 siteUserId:text('site_user_id').notNull(),
 role:text('role').notNull(),
 enrolledAt:integer('enrolled_at').notNull()
},table=>[
 primaryKey({columns:[table.campaignId,table.siteUserId]}),
 check('menei_beta_member_campaign',sql`${table.campaignId} = 'menei-beta-20-1'`),
 check('menei_beta_member_role',sql`${table.role} IN ('owner', 'member')`),
 check('menei_beta_member_time',sql`typeof(${table.enrolledAt}) = 'integer' AND ${table.enrolledAt} >= 0`)
]);

// Attempts contain identity and timing only, never queries or provider results.
export const betaAttempts=sqliteTable('menei_beta_attempts',{
 leaseId:text('lease_id').primaryKey(),
 campaignId:text('campaign_id').notNull(),
 siteUserId:text('site_user_id').notNull(),
 reservedAt:integer('reserved_at').notNull()
},table=>[
 check('menei_beta_attempt_campaign',sql`${table.campaignId} = 'menei-beta-20-1'`),
 check('menei_beta_attempt_time',sql`typeof(${table.reservedAt}) = 'integer' AND ${table.reservedAt} >= 0`)
]);
