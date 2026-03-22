CREATE TABLE IF NOT EXISTS `article_backups` (
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

CREATE INDEX `original_article_idx` ON `article_backups` (`originalArticleId`);
CREATE INDEX `backup_date_idx` ON `article_backups` (`backupDate`);
