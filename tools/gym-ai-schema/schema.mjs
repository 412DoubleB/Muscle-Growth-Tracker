import {integer,sqliteTable,text} from 'drizzle-orm/sqlite-core';

// Preview-only accounting. This table contains no gym queries or app records.
export const gymAiTrials=sqliteTable('menei_gym_ai_trials',{
 id:text('id').primaryKey(),
 used:integer('used').notNull().default(0),
 leaseId:text('lease_id'),
 leaseUntil:integer('lease_until').notNull().default(0),
 nextAllowedAt:integer('next_allowed_at').notNull().default(0)
});
