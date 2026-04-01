-- Migration 0015: Adiciona campo dataPending e unique index em places
-- dataPending: flag para indicar que campos públicos do lugar ainda não foram confirmados
-- places_name_city_idx: unique index para suportar upsert idempotente por (name, city)
--
-- Executar apenas uma vez em cada banco de dados.
-- Caso o índice já exista, ignorar o erro ER_DUP_KEYNAME.

ALTER TABLE `places`
  ADD COLUMN `dataPending` boolean NOT NULL DEFAULT false AFTER `isFeatured`;

CREATE UNIQUE INDEX `places_name_city_idx` ON `places` (`name`, `city`);
