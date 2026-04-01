-- Migration: Add images JSON field to places table
-- Run this against your Railway MySQL database

ALTER TABLE `places` ADD COLUMN `images` JSON DEFAULT NULL AFTER `coverImage`;
