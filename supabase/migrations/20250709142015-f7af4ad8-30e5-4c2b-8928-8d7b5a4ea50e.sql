
-- Criar tabela para transportadoras
CREATE TABLE public.transportadoras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  hora_saida TEXT NOT NULL,
  carga_para TEXT NOT NULL,
  data_adicao DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para atividades
CREATE TABLE public.atividades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transportadora_id UUID REFERENCES public.transportadoras(id) ON DELETE CASCADE,
  transportadora_nome TEXT NOT NULL,
  operador TEXT NOT NULL,
  etapa TEXT NOT NULL,
  volume INTEGER NOT NULL,
  horario_salvo TEXT NOT NULL,
  horario_planejado TEXT NOT NULL,
  horario_finalizacao TEXT,
  status TEXT NOT NULL DEFAULT 'planejado' CHECK (status IN ('planejado', 'concluido', 'aprovado', 'pendente', 'rejeitado')),
  motivo_atraso TEXT,
  tempo_match BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.transportadoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso público (você pode restringir depois conforme necessário)
CREATE POLICY "Permitir acesso completo às transportadoras" 
  ON public.transportadoras 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Permitir acesso completo às atividades" 
  ON public.atividades 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar automaticamente o campo updated_at
CREATE TRIGGER update_atividades_updated_at 
  BEFORE UPDATE ON public.atividades 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
