CREATE TABLE "custom_bangs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"shortcut" text NOT NULL,
	"url" text NOT NULL,
	"label" text NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_system_override" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "disabled_default_bangs" text[] DEFAULT '{}' NOT NULL;
