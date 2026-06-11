-- Seed roles
INSERT INTO `roles` (`code`, `name`, `scope`) VALUES
('superadmin', 'Admin globale', 'global'),
('manager', 'Manager aziendale', 'tenant'),
('user', 'Utente operativo', 'tenant')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
