ALTER TABLE "user_settings" DROP COLUMN IF EXISTS "show_instant_answers";--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "show_calculator" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "show_unit_converter" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "show_weather" boolean DEFAULT true NOT NULL;