-- Manual migration: add bilingual fields for categories.
-- NOTE: This project database has drift vs Prisma migrate history; apply with care.

ALTER TABLE categories
  ADD COLUMN name_en VARCHAR(191) NOT NULL,
  ADD COLUMN name_sw VARCHAR(191) NOT NULL,
  ADD COLUMN description_en TEXT NULL,
  ADD COLUMN description_sw TEXT NULL;

UPDATE categories
  SET name_en = name,
      name_sw = name,
      description_en = description;

