ALTER TABLE `events` MODIFY COLUMN `tags` json;--> statement-breakpoint
ALTER TABLE `places` MODIFY COLUMN `tags` json;--> statement-breakpoint
ALTER TABLE `routes` MODIFY COLUMN `placeIds` json;