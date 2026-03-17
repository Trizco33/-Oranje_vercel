CREATE TABLE `drivers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`whatsapp` varchar(30) NOT NULL,
	`phone` varchar(30),
	`serviceType` varchar(80) NOT NULL,
	`vehicleType` varchar(60),
	`capacity` int,
	`serviceArea` varchar(120),
	`photoUrl` text,
	`isVerified` boolean NOT NULL DEFAULT false,
	`isPartner` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `drivers_id` PRIMARY KEY(`id`)
);
