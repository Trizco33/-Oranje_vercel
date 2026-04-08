CREATE TABLE `guided_tour_stops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tourId` int NOT NULL,
	`placeId` int NOT NULL,
	`stopOrder` int NOT NULL,
	`narrative` text,
	`tip` text,
	`bestMoment` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guided_tour_stops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guided_tours` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`tagline` varchar(255),
	`description` text,
	`theme` varchar(100),
	`duration` varchar(50),
	`coverImage` text,
	`extensionPlaceIds` json,
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guided_tours_id` PRIMARY KEY(`id`),
	CONSTRAINT `guided_tours_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `profile_claims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`placeId` int NOT NULL,
	`contactName` varchar(200) NOT NULL,
	`contactPhone` varchar(30),
	`contactEmail` varchar(320) NOT NULL,
	`contactRole` varchar(200),
	`businessName` varchar(200),
	`instagram` varchar(100),
	`website` text,
	`openingHours` text,
	`address` text,
	`category` varchar(100),
	`description` text,
	`differentials` text,
	`message` text,
	`photos` json,
	`logoUrl` text,
	`coverImageUrl` text,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNote` text,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profile_claims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `places` ADD `claimStatus` enum('unclaimed','claimed','selo_oranje') DEFAULT 'unclaimed' NOT NULL;--> statement-breakpoint
ALTER TABLE `guided_tour_stops` ADD CONSTRAINT `guided_tour_stops_tourId_guided_tours_id_fk` FOREIGN KEY (`tourId`) REFERENCES `guided_tours`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `guided_tour_stops` ADD CONSTRAINT `guided_tour_stops_placeId_places_id_fk` FOREIGN KEY (`placeId`) REFERENCES `places`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profile_claims` ADD CONSTRAINT `profile_claims_placeId_places_id_fk` FOREIGN KEY (`placeId`) REFERENCES `places`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `profile_claims_place_id_idx` ON `profile_claims` (`placeId`);--> statement-breakpoint
CREATE INDEX `profile_claims_status_idx` ON `profile_claims` (`status`);