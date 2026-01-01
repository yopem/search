CREATE INDEX "search_history_user_id_idx" ON "search_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "search_history_user_id_timestamp_idx" ON "search_history" USING btree ("user_id","timestamp");--> statement-breakpoint
CREATE INDEX "search_history_query_idx" ON "search_history" USING btree ("query");