CREATE TABLE `driver_listings` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`name` varchar(255) NOT NULL,
	`whatsapp` varchar(20) NOT NULL,
	`serviceType` varchar(100) NOT NULL,
	`capacity` int,
	`serviceArea` text,
	`photoUrl` text,
	`notes` text,
	`isVerified` boolean NOT NULL DEFAULT false,
	`isPartner` boolean NOT NULL DEFAULT false,
	`status` enum('PENDING','ACTIVE','REJECTED') NOT NULL DEFAULT 'PENDING',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `driver_listings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `status_idx` ON `driver_listings` (`status`);--> statement-breakpoint
CREATE INDEX `isPartner_idx` ON `driver_listings` (`isPartner`);