-- Idempotent MySQL: add bilingual category columns if missing, then backfill and enforce NOT NULL.
-- Safe to run more than once.

SET @db := DATABASE();

-- name_en
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'name_en'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE categories ADD COLUMN name_en VARCHAR(191) NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- name_sw
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'name_sw'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE categories ADD COLUMN name_sw VARCHAR(191) NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- description_en
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'description_en'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE categories ADD COLUMN description_en TEXT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- description_sw
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'description_sw'
);
SET @sql := IF(@exists = 0,
  'ALTER TABLE categories ADD COLUMN description_sw TEXT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

UPDATE categories SET name_en = name WHERE name_en IS NULL OR name_en = '';
UPDATE categories SET name_sw = name WHERE name_sw IS NULL OR name_sw = '';
UPDATE categories SET description_en = description WHERE description_en IS NULL AND description IS NOT NULL;
UPDATE categories SET description_sw = description WHERE description_sw IS NULL AND description IS NOT NULL;

ALTER TABLE categories
  MODIFY COLUMN name_en VARCHAR(191) NOT NULL,
  MODIFY COLUMN name_sw VARCHAR(191) NOT NULL;
