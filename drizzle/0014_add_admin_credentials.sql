CREATE TABLE IF NOT EXISTS `admin_credentials` (
  `userId` int NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `admin_credentials_userId_pk` PRIMARY KEY(`userId`),
  CONSTRAINT `admin_credentials_userId_users_id_fk`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
    ON DELETE CASCADE
);
