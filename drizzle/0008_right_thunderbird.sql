CREATE TABLE `magic_links` (
	`token` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `magic_links_token` PRIMARY KEY(`token`)
);
--> statement-breakpoint
ALTER TABLE `magic_links` ADD CONSTRAINT `magic_links_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;