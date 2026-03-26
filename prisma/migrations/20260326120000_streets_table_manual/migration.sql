-- Manual migration: streets reference table for admin CRUD (optional; apply if not present).
CREATE TABLE IF NOT EXISTS streets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(191) NOT NULL,
  ward_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(191) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  INDEX streets_wardId_fkey (ward_id),
  CONSTRAINT streets_wardId_fkey FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
