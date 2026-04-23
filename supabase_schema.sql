-- ============================================================
-- ALI AVANCES & TAF — Supabase Schema
-- Colle ce SQL dans : Supabase > SQL Editor > New query
-- ============================================================

-- TABLE : advances (avances de fonds)
CREATE TABLE advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advance_type TEXT NOT NULL DEFAULT 'cash',         -- cash | bank transfer | other
  source TEXT NOT NULL DEFAULT 'HABITIQ',            -- HABITIQ | HAJ
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  project TEXT,
  reason TEXT,
  destination TEXT,
  status TEXT NOT NULL DEFAULT 'not justified',      -- not justified | partially justified | justified
  recorded_by_siham BOOLEAN NOT NULL DEFAULT FALSE,
  date_recorded DATE,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE : expenses (dépenses liées à une avance)
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advance_id UUID NOT NULL REFERENCES advances(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE : tasks (tâches TAF)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  project TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'todo',              -- todo | in progress | done
  done BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE : quotes (devis)
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'supply',              -- supply | service
  supplier TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  project TEXT,
  notes TEXT,
  recorded_by_siham BOOLEAN NOT NULL DEFAULT FALSE,
  date_recorded DATE,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DISABLE Row Level Security (app mono-utilisateur, pas d'auth)
-- ============================================================
ALTER TABLE advances DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE quotes DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- DONNÉES DE TEST (optionnel — supprime si tu veux partir vide)
-- ============================================================
INSERT INTO advances (advance_type, source, amount, date, project, reason, destination, status, recorded_by_siham, date_recorded) VALUES
  ('cash',          'HABITIQ', 5000,  '2025-03-10', 'Projet A', 'Achat matériaux',   'Fournisseur local', 'partially justified', TRUE,  '2025-03-12'),
  ('bank transfer', 'HAJ',     12000, '2025-04-01', 'Projet B', 'Frais déplacement', 'Equipe terrain',    'not justified',       FALSE, NULL),
  ('cash',          'HABITIQ', 3000,  '2025-04-15', 'Projet A', 'Outillage',          'Atelier',          'justified',           TRUE,  '2025-04-16');

INSERT INTO expenses (advance_id, description, amount, date)
SELECT id, 'Ciment',       1200, '2025-03-11' FROM advances WHERE reason = 'Achat matériaux';
INSERT INTO expenses (advance_id, description, amount, date)
SELECT id, 'Sable',        800,  '2025-03-13' FROM advances WHERE reason = 'Achat matériaux';
INSERT INTO expenses (advance_id, description, amount, date)
SELECT id, 'Perceuse',     1500, '2025-04-15' FROM advances WHERE reason = 'Outillage';
INSERT INTO expenses (advance_id, description, amount, date)
SELECT id, 'Vis et boulons', 1500, '2025-04-15' FROM advances WHERE reason = 'Outillage';

INSERT INTO tasks (title, description, project, due_date, status, done, notes) VALUES
  ('Commander béton B25',        '20m³ pour dalle RDC',          'Projet A', '2025-05-20', 'in progress', FALSE, 'Appeler fournisseur lundi'),
  ('Plan ferraillage',           '',                              'Projet B', '2025-05-10', 'done',        TRUE,  ''),
  ('Réceptionner carrelage',     'Vérifier quantité et qualité', 'Projet A', '2025-04-28', 'todo',        FALSE, '');

INSERT INTO quotes (type, supplier, amount, date, project, notes, recorded_by_siham, date_recorded) VALUES
  ('supply',  'BATI MAT Casablanca', 45000, '2025-04-05', 'Projet B', 'Délai 2 semaines',    TRUE,  '2025-04-06'),
  ('service', 'Electricité Pro',     18500, '2025-04-10', 'Projet A', 'Inclut main d''œuvre', FALSE, NULL);
