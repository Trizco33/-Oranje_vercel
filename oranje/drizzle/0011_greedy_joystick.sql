CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`coverImageUrl` text,
	`seoTitle` varchar(255),
	`seoDescription` varchar(255),
	`seoKeywords` varchar(500),
	`category` varchar(100) DEFAULT 'Geral',
	`published` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `drivers` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`whatsapp` varchar(20) NOT NULL,
	`photoUrl` text,
	`vehicleModel` varchar(100),
	`vehicleColor` varchar(50),
	`plate` varchar(20),
	`capacity` int,
	`serviceType` varchar(100) NOT NULL,
	`region` varchar(100) NOT NULL,
	`area` text,
	`notes` text,
	`status` enum('PENDING','ACTIVE','REJECTED') NOT NULL DEFAULT 'PENDING',
	`isPartner` boolean NOT NULL DEFAULT false,
	`partnerUntil` timestamp,
	`isVerified` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drivers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `site_content` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`section` varchar(50) NOT NULL,
	`updatedBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_content_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_content_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `site_pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` varchar(255),
	`content` text NOT NULL,
	`coverImageUrl` text,
	`metaTitle` varchar(255),
	`metaDescription` text,
	`metaKeywords` text,
	`published` boolean NOT NULL DEFAULT false,
	`publishedAt` timestamp,
	`createdBy` int NOT NULL,
	`updatedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `site_seo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`page` varchar(100) NOT NULL,
	`metaTitle` varchar(255) NOT NULL,
	`metaDescription` text NOT NULL,
	`metaKeywords` text,
	`ogImage` text,
	`ogTitle` varchar(255),
	`ogDescription` text,
	`canonical` text,
	`index` boolean NOT NULL DEFAULT true,
	`updatedBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_seo_id` PRIMARY KEY(`id`),
	CONSTRAINT `site_seo_page_unique` UNIQUE(`page`)
);
--> statement-breakpoint
DROP TABLE `driver_listings`;--> statement-breakpoint
ALTER TABLE `categories` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `site_content` ADD CONSTRAINT `site_content_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_pages` ADD CONSTRAINT `site_pages_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_pages` ADD CONSTRAINT `site_pages_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `site_seo` ADD CONSTRAINT `site_seo_updatedBy_users_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `slug_idx` ON `articles` (`slug`);--> statement-breakpoint
CREATE INDEX `published_idx` ON `articles` (`published`);--> statement-breakpoint
CREATE INDEX `category_idx` ON `articles` (`category`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `drivers` (`status`);--> statement-breakpoint
CREATE INDEX `isPartner_idx` ON `drivers` (`isPartner`);