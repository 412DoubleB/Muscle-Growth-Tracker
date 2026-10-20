CREATE TABLE `menei_beta_attempts` (
	`lease_id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`site_user_id` text NOT NULL,
	`reserved_at` integer NOT NULL,
	CONSTRAINT "menei_beta_attempt_campaign" CHECK("menei_beta_attempts"."campaign_id" = 'menei-beta-20-1'),
	CONSTRAINT "menei_beta_attempt_time" CHECK(typeof("menei_beta_attempts"."reserved_at") = 'integer' AND "menei_beta_attempts"."reserved_at" >= 0)
);
--> statement-breakpoint
CREATE TABLE `menei_beta_campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`bootstrap_closed` integer NOT NULL,
	`created_at` integer NOT NULL,
	`lease_id` text,
	`lease_until` integer DEFAULT 0 NOT NULL,
	`next_allowed_at` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "menei_beta_campaign_fixed" CHECK("menei_beta_campaigns"."id" = 'menei-beta-20-1' AND "menei_beta_campaigns"."bootstrap_closed" = 1),
	CONSTRAINT "menei_beta_campaign_time" CHECK(typeof("menei_beta_campaigns"."created_at") = 'integer' AND "menei_beta_campaigns"."created_at" >= 0)
);
--> statement-breakpoint
CREATE TABLE `menei_beta_members` (
	`campaign_id` text NOT NULL,
	`site_user_id` text NOT NULL,
	`role` text NOT NULL,
	`enrolled_at` integer NOT NULL,
	PRIMARY KEY(`campaign_id`, `site_user_id`),
	CONSTRAINT "menei_beta_member_campaign" CHECK("menei_beta_members"."campaign_id" = 'menei-beta-20-1'),
	CONSTRAINT "menei_beta_member_role" CHECK("menei_beta_members"."role" IN ('owner', 'member')),
	CONSTRAINT "menei_beta_member_time" CHECK(typeof("menei_beta_members"."enrolled_at") = 'integer' AND "menei_beta_members"."enrolled_at" >= 0)
);
--> statement-breakpoint
-- Drizzle generates the additive tables and snapshot. SQLite triggers below
-- keep admission, accounting and the shared legacy lease in one statement.
CREATE TRIGGER menei_beta_campaign_no_delete BEFORE DELETE ON menei_beta_campaigns
BEGIN SELECT RAISE(ABORT,'beta campaign is permanent'); END;
--> statement-breakpoint
CREATE TRIGGER menei_beta_campaign_identity_immutable BEFORE UPDATE ON menei_beta_campaigns
WHEN NEW.id IS NOT OLD.id OR NEW.owner_user_id IS NOT OLD.owner_user_id
 OR NEW.bootstrap_closed IS NOT OLD.bootstrap_closed OR NEW.created_at IS NOT OLD.created_at
 OR typeof(NEW.lease_until)!='integer' OR NEW.lease_until<0
 OR typeof(NEW.next_allowed_at)!='integer' OR NEW.next_allowed_at<NEW.lease_until
 OR (NEW.lease_id IS NULL AND NEW.lease_until!=0)
 OR (NEW.lease_id IS NOT NULL AND (typeof(NEW.lease_id)!='text' OR length(NEW.lease_id) NOT BETWEEN 1 AND 200))
BEGIN SELECT RAISE(ABORT,'invalid beta campaign update'); END;
--> statement-breakpoint
CREATE TRIGGER menei_beta_member_no_update BEFORE UPDATE ON menei_beta_members
BEGIN SELECT RAISE(ABORT,'beta membership is permanent'); END;
--> statement-breakpoint
CREATE TRIGGER menei_beta_member_no_delete BEFORE DELETE ON menei_beta_members
BEGIN SELECT RAISE(ABORT,'beta membership is permanent'); END;
--> statement-breakpoint
CREATE TRIGGER menei_beta_member_admit BEFORE INSERT ON menei_beta_members
BEGIN
 SELECT CASE WHEN NEW.campaign_id!='menei-beta-20-1'
  OR typeof(NEW.site_user_id)!='text' OR length(NEW.site_user_id) NOT BETWEEN 1 AND 200
  OR instr(NEW.site_user_id,char(0))>0
  OR NEW.site_user_id GLOB '*[' || char(1) || '-' || char(31) || char(127) || ']*'
  OR typeof(NEW.enrolled_at)!='integer' OR NEW.enrolled_at NOT BETWEEN 0 AND 9007199254640991
  OR NEW.role NOT IN ('owner','member') THEN RAISE(ABORT,'invalid beta member') END;
 SELECT CASE WHEN NEW.role='owner' AND (EXISTS(SELECT 1 FROM menei_beta_campaigns)
  OR EXISTS(SELECT 1 FROM menei_beta_members) OR EXISTS(SELECT 1 FROM menei_beta_attempts))
  THEN RAISE(ABORT,'beta bootstrap is closed') END;
 SELECT CASE WHEN NEW.role='member' AND (NOT EXISTS(
  SELECT 1 FROM menei_beta_campaigns c JOIN menei_beta_members m ON m.campaign_id=c.id AND m.site_user_id=c.owner_user_id
  WHERE c.id=NEW.campaign_id AND c.bootstrap_closed=1 AND m.role='owner')
  OR (SELECT count(*) FROM menei_beta_members)>=20)
  THEN RAISE(ABORT,'beta admission is closed') END;
 INSERT INTO menei_gym_ai_trials(id,used,lease_id,lease_until,next_allowed_at)
  SELECT 'menei-gym-ai-trial-1',0,NULL,0,0 WHERE NEW.role='owner'
  ON CONFLICT(id) DO NOTHING;
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM menei_gym_ai_trials
  WHERE id='menei-gym-ai-trial-1' AND typeof(used)='integer' AND used BETWEEN 0 AND 5
   AND typeof(lease_until)='integer' AND lease_until>=0
   AND typeof(next_allowed_at)='integer' AND next_allowed_at>=lease_until)
  THEN RAISE(ABORT,'legacy budget unavailable') END;
 INSERT INTO menei_beta_campaigns(id,owner_user_id,bootstrap_closed,created_at)
  SELECT NEW.campaign_id,NEW.site_user_id,1,NEW.enrolled_at WHERE NEW.role='owner';
END;
--> statement-breakpoint
CREATE TRIGGER menei_beta_attempt_no_update BEFORE UPDATE ON menei_beta_attempts
BEGIN SELECT RAISE(ABORT,'beta attempts are append-only'); END;
--> statement-breakpoint
CREATE TRIGGER menei_beta_attempt_no_delete BEFORE DELETE ON menei_beta_attempts
BEGIN SELECT RAISE(ABORT,'beta attempts are append-only'); END;
--> statement-breakpoint
CREATE TRIGGER menei_beta_attempt_reserve BEFORE INSERT ON menei_beta_attempts
BEGIN
 SELECT CASE WHEN NEW.campaign_id!='menei-beta-20-1'
  OR typeof(NEW.lease_id)!='text' OR length(NEW.lease_id) NOT BETWEEN 1 AND 200
  OR instr(NEW.lease_id,char(0))>0
  OR NEW.lease_id GLOB '*[' || char(1) || '-' || char(31) || char(127) || ']*'
  OR typeof(NEW.reserved_at)!='integer' OR NEW.reserved_at NOT BETWEEN 0 AND 9007199254640991
  THEN RAISE(ABORT,'invalid beta attempt') END;
 SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM menei_beta_campaigns c
  JOIN menei_beta_members m ON m.campaign_id=c.id
  JOIN menei_gym_ai_trials l ON l.id='menei-gym-ai-trial-1'
  WHERE c.id=NEW.campaign_id AND m.site_user_id=NEW.site_user_id AND c.bootstrap_closed=1
   AND typeof(l.used)='integer' AND l.used BETWEEN 0 AND 5
   AND c.lease_until<=NEW.reserved_at AND c.next_allowed_at<=NEW.reserved_at
   AND l.lease_until<=NEW.reserved_at AND l.next_allowed_at<=NEW.reserved_at
   AND (SELECT count(*) FROM menei_beta_attempts a WHERE a.campaign_id=c.id)+l.used<100
   AND (SELECT count(*) FROM menei_beta_attempts a WHERE a.campaign_id=c.id AND a.site_user_id=m.site_user_id)
    +CASE WHEN m.role='owner' THEN l.used ELSE 0 END<5)
  THEN RAISE(ABORT,'beta attempt denied') END;
 UPDATE menei_beta_campaigns SET lease_id=NEW.lease_id,lease_until=NEW.reserved_at+90000,next_allowed_at=NEW.reserved_at+100000
  WHERE id=NEW.campaign_id;
END;
--> statement-breakpoint
CREATE TRIGGER menei_beta_campaign_lease_sync AFTER UPDATE OF lease_id,lease_until,next_allowed_at ON menei_beta_campaigns
BEGIN
 -- The old owner-trial worker uses this same operational lock. Its spent
 -- counter remains unchanged, and a stale release cannot unlock its new lease.
 UPDATE menei_gym_ai_trials SET lease_id=NEW.lease_id,lease_until=NEW.lease_until,next_allowed_at=NEW.next_allowed_at
  WHERE id='menei-gym-ai-trial-1' AND (NEW.lease_id IS NOT NULL OR lease_id=OLD.lease_id);
END;
--> statement-breakpoint
CREATE TRIGGER menei_beta_legacy_guard_update BEFORE UPDATE ON menei_gym_ai_trials
WHEN OLD.id='menei-gym-ai-trial-1' AND EXISTS(SELECT 1 FROM menei_beta_campaigns)
BEGIN
 SELECT CASE WHEN NEW.id IS NOT OLD.id OR typeof(NEW.used)!='integer' OR NEW.used<OLD.used OR NEW.used>5
  OR typeof(NEW.lease_until)!='integer' OR NEW.lease_until<0
  OR typeof(NEW.next_allowed_at)!='integer' OR NEW.next_allowed_at<NEW.lease_until
  OR (NEW.lease_id IS NULL AND NEW.lease_until!=0)
  OR (NEW.lease_id IS NOT NULL AND (typeof(NEW.lease_id)!='text' OR length(NEW.lease_id) NOT BETWEEN 1 AND 200))
  OR NEW.used+(SELECT count(*) FROM menei_beta_attempts)>100
  OR NEW.used+(SELECT count(*) FROM menei_beta_attempts a JOIN menei_beta_campaigns c ON c.id=a.campaign_id WHERE a.site_user_id=c.owner_user_id)>5
  THEN RAISE(ABORT,'invalid legacy budget update') END;
END;
--> statement-breakpoint
CREATE TRIGGER menei_beta_legacy_guard_delete BEFORE DELETE ON menei_gym_ai_trials
WHEN OLD.id='menei-gym-ai-trial-1' AND EXISTS(SELECT 1 FROM menei_beta_campaigns)
BEGIN SELECT RAISE(ABORT,'legacy budget is permanent'); END;
--> statement-breakpoint
CREATE TRIGGER menei_beta_legacy_guard_insert BEFORE INSERT ON menei_gym_ai_trials
WHEN NEW.id='menei-gym-ai-trial-1' AND EXISTS(SELECT 1 FROM menei_beta_campaigns)
 AND NOT EXISTS(SELECT 1 FROM menei_gym_ai_trials WHERE id=NEW.id)
BEGIN SELECT RAISE(ABORT,'legacy budget is missing'); END;
