-- Seed plans
INSERT INTO `plans` (`code`, `name`, `max_users`, `max_tenders`, `max_storage_mb`, `max_ai_requests_month`) VALUES
('free', 'Free', 3, 5, 100, 50),
('pro', 'Professional', 15, 50, 1024, 500),
('enterprise', 'Enterprise', 999999, 999999, 10240, 999999)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
