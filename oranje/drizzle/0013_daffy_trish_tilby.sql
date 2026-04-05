CREATE TABLE `site_route_features` (
	`id` int AUTO_INCREMENT NOT NULL,
	`routeId` int NOT NULL,
	`label` varchar(200),
	`subtitle` text,
	`ctaText` varchar(100),
	`isFeatured` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_route_features_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `places` ADD `slug` varchar(200);--> statement-breakpoint
ALTER TABLE `places` ADD `phone` varchar(30);--> statement-breakpoint
ALTER TABLE `site_route_features` ADD CONSTRAINT `site_route_features_routeId_routes_id_fk` FOREIGN KEY (`routeId`) REFERENCES `routes`(`id`) ON DELETE no action ON UPDATE no action;