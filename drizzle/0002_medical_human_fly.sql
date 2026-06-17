ALTER TABLE "vocabulary_entries" ADD COLUMN "pronunciation" text;--> statement-breakpoint
ALTER TABLE "vocabulary_entries" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "vocabulary_entries" ADD COLUMN "etymology" text;--> statement-breakpoint
ALTER TABLE "vocabulary_entries" ADD COLUMN "mnemonic" text;--> statement-breakpoint
ALTER TABLE "vocabulary_entries" ADD COLUMN "synonyms" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "vocabulary_entries" ADD COLUMN "antonyms" jsonb DEFAULT '[]'::jsonb NOT NULL;