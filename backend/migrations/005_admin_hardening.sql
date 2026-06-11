-- TenderFlow - Admin & Hardening
-- Migration 005: admin features, rate limiting storage

CREATE TABLE IF NOT EXISTS `tenant_settings` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` BIGINT UNSIGNED NOT NULL,
  `setting_key` VARCHAR(100) NOT NULL,
  `setting_value` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_tenant_setting` (`tenant_id`, `setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `tenants` ADD COLUMN `blocked_reason` VARCHAR(255) NULL AFTER `ai_profile_json`;

ALTER TABLE `subscriptions` ADD COLUMN `trial_ends_at` DATETIME NULL AFTER `auto_renew`;
ALTER TABLE `subscriptions` ADD COLUMN `cancelled_at` DATETIME NULL AFTER `trial_ends_at`;
ALTER TABLE `subscriptions` ADD COLUMN `cancellation_reason` VARCHAR(255) NULL AFTER `cancelled_at`;
