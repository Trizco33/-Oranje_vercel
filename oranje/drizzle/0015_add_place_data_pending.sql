-- Migration 0015: Adiciona campo dataPending e unique index em places
-- dataPending: flag para indicar que campos públicos do lugar ainda não foram confirmados
-- places_name_city_idx: unique index para suportar upsert idempotente por (name, city)

ALTER TABLE `places`
  ADD COLUMN `dataPending` boolean NOT NULL DEFAULT false AFTER `isFeatured`;

CREATE UNIQUE INDEX IF NOT EXISTS `places_name_city_idx` ON `places` (`name`, `city`);
