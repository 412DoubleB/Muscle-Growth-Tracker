CREATE TABLE `menei_gym_ai_trials` (
	`id` text PRIMARY KEY NOT NULL,
	`used` integer DEFAULT 0 NOT NULL,
	`lease_id` text,
	`lease_until` integer DEFAULT 0 NOT NULL,
	`next_allowed_at` integer DEFAULT 0 NOT NULL
);
