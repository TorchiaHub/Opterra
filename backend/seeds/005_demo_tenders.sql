-- Demo tenders: 6 real-looking Italian public tenders with requirements, documents, and tasks

-- Gara 1: Ristrutturazione edificio comunale (active)
INSERT IGNORE INTO `tenders` (`id`, `tenant_id`, `title`, `issuer`, `type`, `reference_code`, `description`,
  `value_amount`, `publication_date`, `deadline_at`, `status`, `created_by`)
VALUES (200, 100, 'Lavori di Ristrutturazione Palazzo Comunale', 'Comune di Milano', 'tender',
  'CIG-ZA1345678A', 'Ristrutturazione conservativa ed efficientamento energetico del palazzo comunale sito in Piazza della Scala 1, Milano',
  1200000.00, '2026-05-01', '2026-07-15 12:00:00', 'active', 100);

-- Gara 2: Fornitura arredi scolastici (active)
INSERT IGNORE INTO `tenders` (`id`, `tenant_id`, `title`, `issuer`, `type`, `reference_code`, `description`,
  `value_amount`, `publication_date`, `deadline_at`, `status`, `created_by`)
VALUES (201, 100, 'Fornitura di Arredi per Scuole Primarie', 'Regione Lombardia', 'rfp',
  'CUP-B12J3456789', 'Fornitura di banchi, sedie e attrezzature didattiche per 15 scuole primarie della regione',
  450000.00, '2026-04-15', '2026-06-30 17:00:00', 'active', 100);

-- Gara 3: In fase di revisione (in_review)
INSERT IGNORE INTO `tenders` (`id`, `tenant_id`, `title`, `issuer`, `type`, `reference_code`, `description`,
  `value_amount`, `publication_date`, `deadline_at`, `status`, `created_by`)
VALUES (202, 100, 'Servizi di Pulizia Ospedaliera', 'ASST Santi Paolo e Carlo', 'bando',
  'CIG-ZB2456789AB', 'Servizio di pulizia e sanificazione per i presidi ospedalieri ASST Santi Paolo e Carlo di Milano - durata 24 mesi',
  780000.00, '2026-03-01', '2026-05-20 12:00:00', 'in_review', 100);

-- Gara 4: Bozza (draft)
INSERT IGNORE INTO `tenders` (`id`, `tenant_id`, `title`, `issuer`, `type`, `reference_code`, `description`,
  `value_amount`, `publication_date`, `deadline_at`, `status`, `created_by`)
VALUES (203, 100, 'Manutenzione del Verde Pubblico', 'Comune di Torino', 'tender',
  'CIG-ZC3567890BC', 'Servizio di manutenzione ordinaria e straordinaria del verde pubblico cittadino - 5 lotti',
  350000.00, NULL, '2026-08-10 12:00:00', 'draft', 100);

-- Gara 5: Presentata (submitted)
INSERT IGNORE INTO `tenders` (`id`, `tenant_id`, `title`, `issuer`, `type`, `reference_code`, `description`,
  `value_amount`, `publication_date`, `deadline_at`, `status`, `created_by`)
VALUES (204, 100, 'Fornitura di Dispositivi Medici', 'Azienda Ospedaliera Spedali Civili di Brescia', 'rfp',
  'CUP-C23K4567890', 'Fornitura triennale di dispositivi medici per sala operatoria e reparti chirurgici',
  920000.00, '2026-02-01', '2026-04-15 12:00:00', 'submitted', 100);

-- Gara 6: Aggiudicata (won)
INSERT IGNORE INTO `tenders` (`id`, `tenant_id`, `title`, `issuer`, `type`, `reference_code`, `description`,
  `value_amount`, `publication_date`, `deadline_at`, `status`, `created_by`)
VALUES (205, 100, 'Realizzazione Pista Ciclabile Metropolitana', 'Città Metropolitana di Bologna', 'tender',
  'CIG-ZD4678901CD', 'Progettazione e realizzazione di 12 km di pista ciclabile tra Bologna e San Lazzaro di Savena',
  2100000.00, '2025-11-01', '2026-02-28 12:00:00', 'won', 100);

-- Assignments
INSERT IGNORE INTO `tender_assignments` (`tender_id`, `user_id`, `assignment_type`)
VALUES (200, 100, 'owner'),
       (200, 101, 'contributor'),
       (201, 100, 'owner'),
       (202, 100, 'owner'),
       (202, 101, 'reviewer'),
       (203, 100, 'owner'),
       (204, 100, 'owner'),
       (204, 101, 'contributor'),
       (205, 100, 'owner');

-- Requirements for Gara 1
INSERT IGNORE INTO `requirements` (`id`, `tenant_id`, `tender_id`, `title`, `source`, `created_by`)
VALUES (200, 100, 200, 'Documentazione Amministrativa', 'manual', 100),
       (201, 100, 200, 'Certificazioni Tecniche', 'manual', 100);

INSERT IGNORE INTO `requirement_items` (`tenant_id`, `requirement_id`, `tender_id`, `label`, `description`, `item_type`, `priority`)
VALUES (100, 200, 200, 'DGUE', 'Documento di gara unico europeo compilato in ogni sua parte', 'document', 'mandatory'),
       (100, 200, 200, 'Cauzione provvisoria', 'Cauzione pari al 2% del valore dell''appalto', 'document', 'mandatory'),
       (100, 200, 200, 'Dichiarazione requisiti generali', 'Assenza cause di esclusione ex art. 94 D.Lgs 36/2023', 'declaration', 'mandatory'),
       (100, 201, 200, 'Certificazione SOA OG1', 'Categoria prevalente OG1 classifica III', 'certification', 'mandatory'),
       (100, 201, 200, 'Certificazione SOA OG11', 'Categoria scorporabile OG11 classifica II', 'certification', 'optional'),
       (100, 201, 200, 'Certificazione ISO 14001', 'Sistema di gestione ambientale', 'certification', 'optional');

-- Requirements for Gara 2
INSERT IGNORE INTO `requirements` (`id`, `tenant_id`, `tender_id`, `title`, `source`, `created_by`)
VALUES (202, 100, 201, 'Documentazione Tecnica', 'ai', 100);

INSERT IGNORE INTO `requirement_items` (`tenant_id`, `requirement_id`, `tender_id`, `label`, `description`, `item_type`, `priority`)
VALUES (100, 202, 201, 'Catalogo prodotti completo', 'Catalogo con foto e specifiche tecniche di tutti gli arredi offerti', 'document', 'mandatory'),
       (100, 202, 201, 'Schede tecniche certificazione UNI EN', 'Schede tecniche conformi alle norme UNI EN 1729 per arredi scolastici', 'document', 'mandatory'),
       (100, 202, 201, 'Dichiarazione conformità REACH', 'Dichiarazione conformità ai regolamenti REACH e ROHS', 'declaration', 'mandatory'),
       (100, 202, 201, 'Campione prodotto', 'Consegna campione di banco e sedia per verifica qualitativa', 'document', 'mandatory');

-- Requirements for Gara 3
INSERT IGNORE INTO `requirements` (`id`, `tenant_id`, `tender_id`, `title`, `source`, `created_by`)
VALUES (203, 100, 202, 'Documentazione Amministrativa', 'manual', 100);

INSERT IGNORE INTO `requirement_items` (`tenant_id`, `requirement_id`, `tender_id`, `label`, `description`, `item_type`, `priority`)
VALUES (100, 203, 202, 'DGUE compilato', 'Documento di gara unico europeo', 'document', 'mandatory'),
       (100, 203, 202, 'Certificazione SOA OG13', 'Categoria OG13 classifica I', 'certification', 'mandatory'),
       (100, 203, 202, 'Dichiarazione fatturato specifico', 'Fatturato specifico nel settore pulizie ultimo triennio', 'declaration', 'mandatory');

-- Requirements for Gara 5
INSERT IGNORE INTO `requirements` (`id`, `tenant_id`, `tender_id`, `title`, `source`, `created_by`)
VALUES (204, 100, 204, 'Documentazione Obbligatoria', 'manual', 100);

INSERT IGNORE INTO `requirement_items` (`tenant_id`, `requirement_id`, `tender_id`, `label`, `description`, `item_type`, `priority`)
VALUES (100, 204, 204, 'DGUE', 'Documento di gara unico europeo', 'document', 'mandatory'),
       (100, 204, 204, 'Certificazione ISO 13485', 'Sistema di gestione qualità per dispositivi medici', 'certification', 'mandatory'),
       (100, 204, 204, 'Registrazione Banca Dati BDN', 'Registrazione alla Banca Dati Nazionale dei Dispositivi Medici', 'declaration', 'mandatory');

-- Documents for Gara 1
INSERT IGNORE INTO `documents` (`id`, `tenant_id`, `tender_id`, `document_type`, `title`, `uploaded_by`)
VALUES (200, 100, 200, 'bando', 'Bando integrale gara ristrutturazione', 100),
       (201, 100, 200, 'allegato', 'Disciplinare di gara', 100),
       (202, 100, 200, 'allegato', 'Capitolato tecnico', 100);

-- Documents for Gara 2
INSERT IGNORE INTO `documents` (`id`, `tenant_id`, `tender_id`, `document_type`, `title`, `uploaded_by`)
VALUES (203, 100, 201, 'bando', 'Bando fornitura arredi', 100),
       (204, 100, 201, 'allegato', 'Specifiche tecniche arredi', 100);

-- Documents for Gara 5
INSERT IGNORE INTO `documents` (`id`, `tenant_id`, `tender_id`, `document_type`, `title`, `uploaded_by`)
VALUES (205, 100, 204, 'bando', 'Bando fornitura dispositivi medici', 100);

-- Tasks for Gara 1
INSERT IGNORE INTO `tasks` (`id`, `tenant_id`, `tender_id`, `title`, `description`, `status`, `priority`, `due_at`, `assigned_user_id`, `created_by`)
VALUES (200, 100, 200, 'Compilare DGUE', 'Compilare il Documento di Gara Unico Europeo per la ristrutturazione del palazzo comunale', 'in_progress', 'high', '2026-07-01 12:00:00', 101, 100),
       (201, 100, 200, 'Recuperare certificazione SOA', 'Richiedere alla SOA il certificato OG1 aggiornato', 'todo', 'high', '2026-06-20 12:00:00', 100, 100),
       (202, 100, 200, 'Verificare documentazione fotografica', 'Acquisire documentazione fotografica dello stato attuale dell\'edificio', 'completed', 'medium', '2026-06-10 12:00:00', 101, 100),
       (203, 100, 200, 'Calcolare cauzione provvisoria', 'Verificare calcolo cauzione provvisoria 2% e preparare polizza', 'todo', 'medium', '2026-07-05 12:00:00', 100, 100);

-- Tasks for Gara 2
INSERT IGNORE INTO `tasks` (`id`, `tenant_id`, `tender_id`, `title`, `description`, `status`, `priority`, `due_at`, `assigned_user_id`, `created_by`)
VALUES (204, 100, 201, 'Preparare catalogo prodotti', 'Predisporre catalogo aggiornato con foto e prezzi', 'in_progress', 'high', '2026-06-20 17:00:00', 101, 100),
       (205, 100, 201, 'Contattare fornitori sedie', 'Richiedere preventivi a 3 fornitori di sedie ergonomiche', 'todo', 'medium', '2026-06-15 17:00:00', 101, 100),
       (206, 100, 201, 'Compilare schede tecniche', 'Inserire specifiche tecniche conformi UNI EN 1729', 'todo', 'high', '2026-06-25 17:00:00', 100, 100);

-- Tasks for Gara 3
INSERT IGNORE INTO `tasks` (`id`, `tenant_id`, `tender_id`, `title`, `description`, `status`, `priority`, `due_at`, `assigned_user_id`, `created_by`)
VALUES (207, 100, 202, 'Revisionare offerta economica', 'Controllare la congruità dell\'offerta economica presentata', 'in_progress', 'high', '2026-05-15 12:00:00', 100, 100),
       (208, 100, 202, 'Integrare dichiarazioni mancanti', 'Verificare e integrare eventuali dichiarazioni richieste dalla commissione', 'todo', 'medium', '2026-05-20 12:00:00', 101, 100);

-- Tasks for Gara 4 (draft - in preparazione)
INSERT IGNORE INTO `tasks` (`id`, `tenant_id`, `tender_id`, `title`, `description`, `status`, `priority`, `due_at`, `assigned_user_id`, `created_by`)
VALUES (209, 100, 203, 'Analizzare capitolato verde pubblico', 'Leggere e analizzare il capitolato per i 5 lotti', 'todo', 'high', '2026-07-01 12:00:00', 101, 100),
       (210, 100, 203, 'Valutare attrezzature necessarie', 'Elencare macchinari e attrezzature necessarie per la manutenzione del verde', 'todo', 'medium', '2026-07-15 12:00:00', 100, 100);

-- Tasks for Gara 5 (submitted)
INSERT IGNORE INTO `tasks` (`id`, `tenant_id`, `tender_id`, `title`, `description`, `status`, `priority`, `due_at`, `assigned_user_id`, `created_by`)
VALUES (211, 100, 204, 'Monitorare esito gara', 'Controllare quotidianamente il portale per eventuali comunicazioni', 'in_progress', 'high', '2026-05-30 12:00:00', 100, 100),
       (212, 100, 204, 'Preparare documentazione controdeduzioni', 'Predisporre template per eventuali controdeduzioni o chiarimenti', 'completed', 'medium', '2026-04-10 12:00:00', 101, 100);
