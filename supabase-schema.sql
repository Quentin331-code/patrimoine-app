-- ===========================================
-- PATRIMOINE APP - Database Schema
-- Exécute ce fichier dans Supabase → SQL Editor
-- ===========================================

-- Actifs manuels (immobilier, épargne, non coté, etc.)
CREATE TABLE assets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, -- immobilier, bourse, nonCote, crypto, or, autres, epargne, passif
  name TEXT NOT NULL,
  subcategory TEXT,
  value DECIMAL(15,2) NOT NULL DEFAULT 0,
  revenu DECIMAL(15,2), -- revenu mensuel
  rev_type TEXT,
  remaining TEXT, -- durée restante (passif)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio live (actions, ETF, crypto via ticker)
CREATE TABLE portfolio (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker TEXT NOT NULL,
  qty DECIMAL(15,8) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Métaux précieux (en grammes)
CREATE TABLE metals (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  metal_id TEXT NOT NULL, -- gold, silver, platinum, palladium
  grams DECIMAL(15,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allocation cible
CREATE TABLE targets (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  percentage INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, category)
);

-- Historique (snapshots)
CREATE TABLE history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Objectifs
CREATE TABLE goals (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target DECIMAL(15,2) NOT NULL,
  deadline TEXT,
  color TEXT DEFAULT '#5865f2',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (chaque utilisateur ne voit que ses données)
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE metals ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users see own assets" ON assets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own portfolio" ON portfolio FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own metals" ON metals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own targets" ON targets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own history" ON history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own goals" ON goals FOR ALL USING (auth.uid() = user_id);

-- Index pour performance
CREATE INDEX idx_assets_user ON assets(user_id);
CREATE INDEX idx_portfolio_user ON portfolio(user_id);
CREATE INDEX idx_metals_user ON metals(user_id);
CREATE INDEX idx_history_user ON history(user_id);
CREATE INDEX idx_goals_user ON goals(user_id);
