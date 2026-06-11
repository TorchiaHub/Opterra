-- TenderFlow - Gare e Checklist
-- Migration 002: tenders, tender_assignments, requirements, requirement_items

CREATE TABLE IF NOT EXISTS `tenders` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `issuer` VARCHAR(255) NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'tender',
  `reference_code` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `value_amount` DECIMAL(15,2) NULL,
  `currency` VARCHAR(10) NOT NULL DEFAULT 'EUR',
  `publication_date` DATE NULL,
  `deadline_at` DATETIME NOT NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'draft',
  `source_type` VARCHAR(30) NOT NULL DEFAULT 'manual',
  `source_url` VARCHAR(500) NULL,
  `go_nogo_decision` VARCHAR(20) NOT NULL DEFAULT 'pending',
  `go_nogo_score` DECIMAL(5,2) NULL,
  `created_by` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
  INDEX `idx_tenders_tenant_status` (`tenant_id`, `status`, `deadline_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tender_assignments` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tender_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NULL,
  `group_id` BIGINT UNSIGNED NULL,
  `assignment_type` VARCHAR(30) NOT NULL DEFAULT 'contributor',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`tender_id`) REFERENCES `tenders`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `requirements` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` BIGINT UNSIGNED NOT NULL,
  `tender_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `source` VARCHAR(30) NOT NULL DEFAULT 'manual',
  `created_by` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`),
  FOREIGN KEY (`tender_id`) REFERENCES `tenders`(`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `requirement_items` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tenant_id` BIGINT UNSIGNED NOT NULL,
  `requirement_id` BIGINT UNSIGNED NOT NULL,
  `tender_id` BIGINT UNSIGNED NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `item_type` VARCHAR(50) NOT NULL DEFAULT 'document',
  `priority` VARCHAR(30) NOT NULL DEFAULT 'mandatory',
  `status` VARCHAR(30) NOT NULL DEFAULT 'pending',
  `due_at` DATETIME NULL,
  `assigned_user_id` BIGINT UNSIGNED NULL,
  `notes` TEXT NULL,
  `ai_extracted` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`),
  FOREIGN KEY (`requirement_id`) REFERENCES `requirements`(`id`),
  FOREIGN KEY (`tender_id`) REFERENCES `tenders`(`id`),
  FOREIGN KEY (`assigned_user_id`) REFERENCES `users`(`id`),
  INDEX `idx_reqitems_tenant_tender` (`tenant_id`, `tender_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
