CREATE INDEX "custom_bangs_user_id_idx" ON "custom_bangs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "custom_bangs_user_id_enabled_idx" ON "custom_bangs" USING btree ("user_id","is_enabled");--> statement-breakpoint
ALTER TABLE "custom_bangs" ADD CONSTRAINT "custom_bangs_user_id_shortcut_unique" UNIQUE("user_id","shortcut");
