-- Seed superadmin (password: password123)
INSERT INTO `tenants` (`id`, `name`, `slug`, `status`)
VALUES (1, 'TenderFlow Admin', 'tenderflow-admin', 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `users` (`id`, `tenant_id`, `email`, `password_hash`, `first_name`, `last_name`, `status`)
VALUES (1, 1, 'admin@tenderflow.app', '$2b$12$LJ3m4ys3Lk0TSwHnbfOMT.yjYPCFJqPNiRRfMjnZFCQHSUxMjKqVe', 'Admin', 'TenderFlow', 'active')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

INSERT INTO `user_roles` (`user_id`, `role_id`, `tenant_id`)
SELECT 1, `id`, 1 FROM `roles` WHERE `code` = 'superadmin'
ON DUPLICATE KEY UPDATE `user_id` = `user_id`;
