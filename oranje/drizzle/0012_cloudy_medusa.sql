CREATE TABLE `article_backups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`originalArticleId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`coverImageUrl` text,
	`seoTitle` varchar(255),
	`seoDescription` varchar(255),
	`seoKeywords` varchar(500),
	`category` varchar(100),
	`published` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp,
	`backupReason` varchar(50) NOT NULL,
	`backupDate` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `article_backups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `places` ADD `city` varchar(100) DEFAULT 'Holambra';--> statement-breakpoint
ALTER TABLE `places` ADD `state` varchar(100) DEFAULT 'SP';--> statement-breakpoint
ALTER TABLE `places` ADD `country` varchar(100) DEFAULT 'Brasil';--> statement-breakpoint
ALTER TABLE `places` ADD `images` json;--> statement-breakpoint
ALTER TABLE `places` ADD `isFree` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `places` ADD `dataPending` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `routes` ADD `highlights` json;--> statement-breakpoint
ALTER TABLE `routes` ADD `placeNotes` json;--> statement-breakpoint
ALTER TABLE `places` ADD CONSTRAINT `places_name_city_idx` UNIQUE(`name`,`city`);--> statement-breakpoint
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `original_article_idx` ON `article_backups` (`originalArticleId`);--> statement-breakpoint
CREATE INDEX `backup_date_idx` ON `article_backups` (`backupDate`);