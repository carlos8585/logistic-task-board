
-- Adicionar coluna de ID sequencial à tabela atividades
ALTER TABLE public.atividades ADD COLUMN id_sequencial SERIAL;

-- Criar índice para melhor performance
CREATE INDEX idx_atividades_id_sequencial ON public.atividades(id_sequencial);
