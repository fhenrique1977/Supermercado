-- Execute este SQL no Supabase SQL Editor
-- Supabase → SQL Editor → New Query → cole e clique em Run

CREATE TABLE itens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome       text NOT NULL,
  quantidade integer NOT NULL DEFAULT 1,
  categoria  text NOT NULL DEFAULT 'Outros',
  comprado   boolean NOT NULL DEFAULT false,
  criado_em  timestamptz NOT NULL DEFAULT now()
);

-- Habilita Row Level Security (boa prática mesmo sem login)
ALTER TABLE itens ENABLE ROW LEVEL SECURITY;

-- Permite leitura e escrita pública (sem autenticação)
CREATE POLICY "Acesso público" ON itens
  FOR ALL
  USING (true)
  WITH CHECK (true);
