-- Demo data: 1 tenant, 1 manager, 1 user, 3 tenders + requirements + assignments

-- Tenant demo
INSERT INTO `tenants` (`id`, `name`, `slug`, `vat_number`, `industry`, `country`, `status`)
VALUES (100, 'Azienda Demo Srl', 'demo-azienda', 'IT01234567890', 'Costruzioni', 'IT', 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Subscription free per tenant demo
INSERT INTO `subscriptions` (`tenant_id`, `plan_id`, `status`, `starts_at`, `ends_at`, `auto_renew`)
SELECT 100, id, 'active', '2026-01-01', '2027-01-01', 1
FROM `plans` WHERE `code` = 'free'
ON DUPLICATE KEY UPDATE `tenant_id` = `tenant_id`;

-- Manager demo (password: password123)
INSERT INTO `users` (`id`, `tenant_id`, `email`, `password_hash`, `first_name`, `last_name`, `status`)
VALUES (100, 100, 'marco@demo.it', '$2b$12$LJ3m4ys3Lk0TSwHnbfOMT.yjYPCFJqPNiRRfMjnZFCQHSUxMjKqVe', 'Marco', 'Bianchi', 'active')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

INSERT INTO `user_roles` (`user_id`, `role_id`, `tenant_id`)
SELECT 100, `id`, 100 FROM `roles` WHERE `code` = 'manager'
ON DUPLICATE KEY UPDATE `user_id` = `user_id`;

-- User operativo demo
INSERT INTO `users` (`id`, `tenant_id`, `email`, `password_hash`, `first_name`, `last_name`, `status`)
VALUES (101, 100, 'lisa@demo.it', '$2b$12$LJ3m4ys3Lk0TSwHnbfOMT.yjYPCFJqPNiRRfMjnZFCQHSUxMjKqVe', 'Lisa', 'Rossi', 'active')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);

INSERT INTO `user_roles` (`user_id`, `role_id`, `tenant_id`)
SELECT 101, `id`, 100 FROM `roles` WHERE `code` = 'user'
ON DUPLICATE KEY UPDATE `user_id` = `user_id`;

-- Gara 1: attiva
INSERT INTO `tenders` (`id`, `tenant_id`, `title`, `issuer`, `type`, `reference_code`, `description`,
  `value_amount`, `deadline_at`, `status`, `created_by`)
VALUES (100, 100, 'Lavori di Ristrutturazione Scuola Elementare', 'Comune di Milano', 'tender',
  'CIG-Z123456789', 'Ristrutturazione completa edificio scolastico via Roma 15 - Milano',
  250000.00, '2026-09-30 12:00:00', 'active', 100)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Gara 2: draft
INSERT INTO `tenders` (`id`, `tenant_id`, `title`, `issuer`, `type`, `reference_code`, `description`,
  `value_amount`, `deadline_at`, `status`, `created_by`)
VALUES (101, 100, 'Fornitura Arredi Ufficio', 'Regione Lombardia', 'rfp',
  'CUP-A987654321', 'Fornitura di arredi per uffici regionali - lotto unico',
  85000.00, '2026-10-15 17:00:00', 'draft', 100)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Gara 3: won
INSERT INTO `tenders` (`id`, `tenant_id`, `title`, `issuer`, `type`, `reference_code`, `description`,
  `value_amount`, `publication_date`, `deadline_at`, `status`, `created_by`)
VALUES (102, 100, 'Manutenzione Strade Provinciali', 'Provincia di Torino', 'tender',
  'CIG-E456789012', 'Manutenzione ordinaria e straordinaria strade provinciali lotto 3',
  510000.00, '2026-01-10', '2026-03-20 12:00:00', 'won', 100)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Assignments
INSERT INTO `tender_assignments` (`tender_id`, `user_id`, `assignment_type`)
VALUES (100, 100, 'owner'),
       (100, 101, 'contributor'),
       (101, 100, 'owner'),
       (102, 100, 'owner'),
       (102, 101, 'reviewer')
ON DUPLICATE KEY UPDATE `tender_id` = `tender_id`;

-- Requirements Gara 1
INSERT INTO `requirements` (`id`, `tenant_id`, `tender_id`, `title`, `source`, `created_by`)
VALUES (100, 100, 100, 'Documentazione Amministrativa', 'manual', 100),
       (101, 100, 100, 'Certificazioni Richieste', 'manual', 100)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

INSERT INTO `requirement_items` (`tenant_id`, `requirement_id`, `tender_id`, `label`, `description`, `item_type`, `priority`)
VALUES (100, 100, 100, 'DGUE', 'Documento di gara unico europeo', 'document', 'mandatory'),
       (100, 100, 100, 'Cauzione provvisoria', 'Cauzione del 2% valore appalto', 'document', 'mandatory'),
       (100, 100, 100, 'Dichiarazione requisiti generali', 'Assenza cause esclusione art. 80', 'declaration', 'mandatory'),
       (100, 101, 100, 'Certificazione SOA', 'Categoria prevalente OG1', 'certification', 'mandatory'),
       (100, 101, 100, 'Certificazione ISO 9001', 'Sistema qualità aziendale', 'certification', 'optional'),
       (100, 101, 100, 'Bilancio approvato ultimo triennio', '', 'document', 'mandatory');

-- Requirements Gara 2
INSERT INTO `requirements` (`id`, `tenant_id`, `tender_id`, `title`, `source`, `created_by`)
VALUES (102, 100, 101, 'Documentazione Tecnica', 'ai', 100)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

INSERT INTO `requirement_items` (`tenant_id`, `requirement_id`, `tender_id`, `label`, `description`, `item_type`, `priority`)
VALUES (100, 102, 101, 'Catalogo prodotti', '', 'document', 'mandatory'),
       (100, 102, 101, 'Schede tecniche arredi', '', 'document', 'mandatory'),
       (100, 102, 101, 'Dichiarazione conformità normative', '', 'declaration', 'mandatory');
