ALTER TABLE "user_stats" ADD COLUMN "longest_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_stats" ADD COLUMN "streak_freezes" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_stats" ADD COLUMN "email_reminders" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user_stats" ADD COLUMN "reminder_hour" integer DEFAULT 9 NOT NULL;