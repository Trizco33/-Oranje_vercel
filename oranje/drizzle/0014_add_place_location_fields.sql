-- Migration: Adiciona campos de localização e isFree à tabela places
-- Para suporte à feature "Perto de Mim" (geolocalização)

ALTER TABLE `places`
  ADD COLUMN `city` varchar(100) DEFAULT 'Holambra' AFTER `address`,
  ADD COLUMN `state` varchar(100) DEFAULT 'SP' AFTER `city`,
  ADD COLUMN `country` varchar(100) DEFAULT 'Brasil' AFTER `state`,
  ADD COLUMN `isFree` boolean NOT NULL DEFAULT false AFTER `images`;
