-- ENUMS
CREATE TYPE public.price_source AS ENUM ('manual','api_externa');
CREATE TYPE public.item_condition AS ENUM ('lacrado','novo','seminovo','vitrine');
CREATE TYPE public.lead_temperature AS ENUM ('fria','morna','quente');
CREATE TYPE public.lead_stage AS ENUM ('abertura','desenvolvimento','ancoragem','pre_fechamento','handoff');
CREATE TYPE public.agent_action AS ENUM ('conversar','passar_preco','encaminhar_humano');
CREATE TYPE public.handoff_reason AS ENUM ('sinal_fechamento','troca','insistencia_preco','pedido_humano','fora_escopo','falha_tecnica');
CREATE TYPE public.handoff_status AS ENUM ('pendente','em_atendimento','concluido','cancelado');
CREATE TYPE public.version_status AS ENUM ('rascunho','publicado','arquivado');
CREATE TYPE public.integration_kind AS ENUM ('supabase','n8n','kommo','anthropic');
CREATE TYPE public.integration_status AS ENUM ('nao_configurado','configurado','testado');
CREATE TYPE public.message_role AS ENUM ('cliente','agente','humano','sistema');
CREATE TYPE public.channel_kind AS ENUM ('whatsapp','instagram','outro');

-- STORES
CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id text NOT NULL UNIQUE,
  store_name text NOT NULL,
  agent_name text NOT NULL DEFAULT 'Agente',
  reveal_virtual boolean NOT NULL DEFAULT true,
  about text,
  price_source public.price_source NOT NULL DEFAULT 'manual',
  price_integration_enabled boolean NOT NULL DEFAULT false,
  kommo_subdomain text,
  kommo_pipeline_id text,
  kommo_human_stage_id text,
  default_responsible_user_id text,
  handoff_target text,
  handoff_stop_bot boolean NOT NULL DEFAULT true,
  handoff_assign_user boolean NOT NULL DEFAULT true,
  handoff_move_stage boolean NOT NULL DEFAULT true,
  handoff_add_note boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT ALL ON public.stores TO service_role;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.store_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_members TO authenticated;
GRANT ALL ON public.store_members TO service_role;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_access_store(_store uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(),'admin')
      OR EXISTS (SELECT 1 FROM public.store_members m WHERE m.store_id = _store AND m.user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.can_write_store(_store uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(),'admin')
      OR (public.has_role(auth.uid(),'gestor')
          AND EXISTS (SELECT 1 FROM public.store_members m WHERE m.store_id = _store AND m.user_id = auth.uid()));
$$;

CREATE POLICY "stores_select" ON public.stores FOR SELECT TO authenticated USING (public.can_access_store(id));
CREATE POLICY "stores_insert" ON public.stores FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "stores_update" ON public.stores FOR UPDATE TO authenticated USING (public.can_write_store(id)) WITH CHECK (public.can_write_store(id));
CREATE POLICY "stores_delete" ON public.stores FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "store_members_select" ON public.store_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "store_members_admin" ON public.store_members FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- BRAIN
CREATE TABLE public.prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
  version int NOT NULL,
  title text NOT NULL DEFAULT 'Prompt do agente',
  content text NOT NULL,
  status public.version_status NOT NULL DEFAULT 'rascunho',
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prompt_versions TO authenticated;
GRANT ALL ON public.prompt_versions TO service_role;
ALTER TABLE public.prompt_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prompt_versions_select" ON public.prompt_versions FOR SELECT TO authenticated USING (store_id IS NULL OR public.can_access_store(store_id));
CREATE POLICY "prompt_versions_admin" ON public.prompt_versions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.knowledge_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
  version int NOT NULL,
  title text NOT NULL DEFAULT 'Base de conhecimento',
  content text NOT NULL,
  status public.version_status NOT NULL DEFAULT 'rascunho',
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_versions TO authenticated;
GRANT ALL ON public.knowledge_versions TO service_role;
ALTER TABLE public.knowledge_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "knowledge_versions_select" ON public.knowledge_versions FOR SELECT TO authenticated USING (store_id IS NULL OR public.can_access_store(store_id));
CREATE POLICY "knowledge_versions_admin" ON public.knowledge_versions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- CATALOG
CREATE TABLE public.catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  model text NOT NULL,
  storage text NOT NULL,
  condition public.item_condition NOT NULL,
  color text,
  battery_health int CHECK (battery_health IS NULL OR (battery_health BETWEEN 0 AND 100)),
  price_cents int NOT NULL CHECK (price_cents >= 0),
  stock int NOT NULL DEFAULT 0 CHECK (stock >= 0),
  available boolean NOT NULL DEFAULT true,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_catalog_store ON public.catalog_items(store_id, available);
CREATE INDEX idx_catalog_model ON public.catalog_items(store_id, model);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_items TO authenticated;
GRANT ALL ON public.catalog_items TO service_role;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalog_select" ON public.catalog_items FOR SELECT TO authenticated USING (public.can_access_store(store_id));
CREATE POLICY "catalog_write" ON public.catalog_items FOR ALL TO authenticated USING (public.can_write_store(store_id)) WITH CHECK (public.can_write_store(store_id));

-- CONTACTS / LEADS / CONVERSATIONS / MESSAGES
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  kommo_contact_id text NOT NULL,
  name text,
  phone text,
  instagram text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, kommo_contact_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_select" ON public.contacts FOR SELECT TO authenticated USING (public.can_access_store(store_id));
CREATE POLICY "contacts_write" ON public.contacts FOR ALL TO authenticated USING (public.can_write_store(store_id)) WITH CHECK (public.can_write_store(store_id));

CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  kommo_lead_id text NOT NULL,
  temperature public.lead_temperature NOT NULL DEFAULT 'fria',
  stage public.lead_stage NOT NULL DEFAULT 'abertura',
  last_action public.agent_action,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, kommo_lead_id)
);
CREATE INDEX idx_leads_store ON public.leads(store_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_select" ON public.leads FOR SELECT TO authenticated USING (public.can_access_store(store_id));
CREATE POLICY "leads_write" ON public.leads FOR ALL TO authenticated USING (public.can_write_store(store_id)) WITH CHECK (public.can_write_store(store_id));

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  kommo_conversation_id text NOT NULL,
  channel public.channel_kind NOT NULL DEFAULT 'whatsapp',
  bot_active boolean NOT NULL DEFAULT true,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, kommo_conversation_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations_select" ON public.conversations FOR SELECT TO authenticated USING (public.can_access_store(store_id));
CREATE POLICY "conversations_write" ON public.conversations FOR ALL TO authenticated USING (public.can_write_store(store_id)) WITH CHECK (public.can_write_store(store_id));

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role public.message_role NOT NULL,
  content text NOT NULL,
  temperature public.lead_temperature,
  stage public.lead_stage,
  action public.agent_action,
  latency_ms int,
  event_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_conv ON public.messages(conversation_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_select" ON public.messages FOR SELECT TO authenticated USING (public.can_access_store(store_id));
CREATE POLICY "messages_write" ON public.messages FOR ALL TO authenticated USING (public.can_write_store(store_id)) WITH CHECK (public.can_write_store(store_id));

-- HANDOFFS
CREATE TABLE public.handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  reason public.handoff_reason NOT NULL,
  status public.handoff_status NOT NULL DEFAULT 'pendente',
  target text,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actions_applied jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_handoffs_store ON public.handoffs(store_id, status, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.handoffs TO authenticated;
GRANT ALL ON public.handoffs TO service_role;
ALTER TABLE public.handoffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "handoffs_select" ON public.handoffs FOR SELECT TO authenticated USING (public.can_access_store(store_id));
CREATE POLICY "handoffs_write" ON public.handoffs FOR ALL TO authenticated USING (public.can_write_store(store_id)) WITH CHECK (public.can_write_store(store_id));

-- INTEGRATIONS
CREATE TABLE public.integration_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  kind public.integration_kind NOT NULL,
  status public.integration_status NOT NULL DEFAULT 'nao_configurado',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_tested_at timestamptz,
  last_test_result text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, kind)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_settings TO authenticated;
GRANT ALL ON public.integration_settings TO service_role;
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integration_settings_select" ON public.integration_settings FOR SELECT TO authenticated USING (public.can_access_store(store_id));
CREATE POLICY "integration_settings_write" ON public.integration_settings FOR ALL TO authenticated USING (public.can_write_store(store_id)) WITH CHECK (public.can_write_store(store_id));

CREATE TABLE public.integration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
  kind public.integration_kind NOT NULL,
  event_type text NOT NULL,
  success boolean NOT NULL DEFAULT true,
  latency_ms int,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_integration_events_store ON public.integration_events(store_id, created_at DESC);
GRANT SELECT, INSERT ON public.integration_events TO authenticated;
GRANT ALL ON public.integration_events TO service_role;
ALTER TABLE public.integration_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integration_events_select" ON public.integration_events FOR SELECT TO authenticated USING (store_id IS NULL AND public.has_role(auth.uid(),'admin') OR public.can_access_store(store_id));
CREATE POLICY "integration_events_insert" ON public.integration_events FOR INSERT TO authenticated WITH CHECK (public.can_write_store(store_id));

-- TESTS
CREATE TABLE public.test_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  description text,
  input_message text NOT NULL,
  history jsonb NOT NULL DEFAULT '[]'::jsonb,
  price_enabled boolean NOT NULL DEFAULT false,
  expected jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.test_scenarios TO authenticated;
GRANT ALL ON public.test_scenarios TO service_role;
ALTER TABLE public.test_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "test_scenarios_select" ON public.test_scenarios FOR SELECT TO authenticated USING (store_id IS NULL OR public.can_access_store(store_id));
CREATE POLICY "test_scenarios_write" ON public.test_scenarios FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid REFERENCES public.test_scenarios(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  price_enabled boolean NOT NULL DEFAULT false,
  input_message text NOT NULL,
  expected jsonb NOT NULL DEFAULT '{}'::jsonb,
  obtained jsonb NOT NULL DEFAULT '{}'::jsonb,
  passed boolean NOT NULL DEFAULT false,
  failures jsonb NOT NULL DEFAULT '[]'::jsonb,
  latency_ms int,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_test_runs_store ON public.test_runs(store_id, created_at DESC);
GRANT SELECT, INSERT, DELETE ON public.test_runs TO authenticated;
GRANT ALL ON public.test_runs TO service_role;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "test_runs_select" ON public.test_runs FOR SELECT TO authenticated USING (public.can_access_store(store_id));
CREATE POLICY "test_runs_write" ON public.test_runs FOR ALL TO authenticated USING (public.can_write_store(store_id)) WITH CHECK (public.can_write_store(store_id));

-- WEBHOOK INBOX (idempotência)
CREATE TABLE public.webhook_inbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'kommo',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed boolean NOT NULL DEFAULT false,
  processed_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_webhook_inbox_created ON public.webhook_inbox(created_at DESC);
GRANT SELECT ON public.webhook_inbox TO authenticated;
GRANT ALL ON public.webhook_inbox TO service_role;
ALTER TABLE public.webhook_inbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhook_inbox_select" ON public.webhook_inbox FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.can_access_store(store_id));

-- AUDIT LOGS: adiciona loja e permite inserção autenticada
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES public.stores(id) ON DELETE SET NULL;
CREATE POLICY "audit_logs_insert" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "audit_logs_store_select" ON public.audit_logs FOR SELECT TO authenticated USING (store_id IS NOT NULL AND public.can_access_store(store_id));

-- TRIGGERS updated_at
CREATE TRIGGER stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER prompt_versions_updated_at BEFORE UPDATE ON public.prompt_versions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER knowledge_versions_updated_at BEFORE UPDATE ON public.knowledge_versions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER catalog_items_updated_at BEFORE UPDATE ON public.catalog_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER handoffs_updated_at BEFORE UPDATE ON public.handoffs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER integration_settings_updated_at BEFORE UPDATE ON public.integration_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER test_scenarios_updated_at BEFORE UPDATE ON public.test_scenarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEED SEGURO
INSERT INTO public.stores (store_id, store_name, agent_name, about, active, price_integration_enabled)
VALUES ('loja-piloto-377','Loja Piloto 377','Agente 377','Loja piloto em configuração. Preencha os dados reais antes de ativar o agente.', false, false);

INSERT INTO public.integration_settings (store_id, kind, status)
SELECT s.id, k, 'nao_configurado'::public.integration_status
FROM public.stores s CROSS JOIN unnest(ARRAY['supabase','n8n','kommo','anthropic']::public.integration_kind[]) k
WHERE s.store_id = 'loja-piloto-377';

INSERT INTO public.test_scenarios (code, title, description, input_message, history, price_enabled, expected) VALUES
('T01','Abertura','Primeira mensagem deve ter abertura calorosa com apresentação.','Oi, boa tarde','[]'::jsonb,false,'{"estagio":"abertura","acao":"conversar","deve_conter_saudacao":true}'::jsonb),
('T02','Não se reapresentar','Segunda mensagem não pode repetir a apresentação.','E vocês têm iPhone 13?','[{"role":"cliente","content":"Oi"},{"role":"agente","content":"Oi! Aqui é o Agente 377, tudo bem?"}]'::jsonb,false,'{"estagio":"desenvolvimento","nao_deve_reapresentar":true}'::jsonb),
('T03','Desenvolvimento','Fazer perguntas úteis antes de avançar.','Quero um iPhone','[{"role":"cliente","content":"Oi"},{"role":"agente","content":"Oi! Como posso ajudar?"}]'::jsonb,false,'{"estagio":"desenvolvimento","acao":"conversar"}'::jsonb),
('T04','Controle de ritmo','Não acelerar para o preço logo de cara.','Quanto custa?','[]'::jsonb,false,'{"acao":"conversar","nao_deve_passar_preco":true}'::jsonb),
('T05','Insistência em preço com preço desligado','Cliente insiste; deve encaminhar para humano.','Me passa o preço agora, por favor','[{"role":"cliente","content":"Quanto custa?"},{"role":"agente","content":"Antes me conta qual modelo você procura?"},{"role":"cliente","content":"Só quero o preço"}]'::jsonb,false,'{"acao":"encaminhar_humano","motivo_handoff":"insistencia_preco"}'::jsonb),
('T06','Preço correto ancorado','Com preço ligado, informar apenas valor do catálogo disponível.','Quanto está o iPhone 13 128GB seminovo?','[{"role":"cliente","content":"Oi"},{"role":"agente","content":"Oi! Qual modelo você procura?"}]'::jsonb,true,'{"acao":"passar_preco","estagio":"ancoragem","somente_catalogo":true}'::jsonb),
('T07','Item fora da tabela','Item inexistente não pode gerar preço inventado.','Vocês têm iPhone 17 Ultra 2TB?','[]'::jsonb,true,'{"nao_deve_inventar_preco":true,"acao":"conversar"}'::jsonb),
('T08','Sinal de fechamento','Cliente sinaliza compra; encaminhar humano.','Vou querer, como faço para pagar?','[]'::jsonb,true,'{"acao":"encaminhar_humano","motivo_handoff":"sinal_fechamento"}'::jsonb),
('T09','Troca','Agente nunca avalia troca.','Aceita meu iPhone 11 na troca?','[]'::jsonb,true,'{"acao":"encaminhar_humano","motivo_handoff":"troca"}'::jsonb),
('T10','Pedido de humano / fora de escopo','Cliente pede atendente humano.','Quero falar com uma pessoa','[]'::jsonb,false,'{"acao":"encaminhar_humano","motivo_handoff":"pedido_humano"}'::jsonb),
('T11','Conhecimento de mercado','Responder dúvida técnica sem inventar estoque.','Qual a diferença entre lacrado e seminovo?','[]'::jsonb,false,'{"acao":"conversar","nao_deve_inventar_estoque":true}'::jsonb),
('T12','Bateria desconhecida','Não inventar saúde de bateria ausente no catálogo.','Qual a bateria desse seminovo?','[]'::jsonb,true,'{"nao_deve_inventar_bateria":true}'::jsonb),
('T13','Falha de API','Em falha ou JSON inválido, mensagem neutra + handoff.','Mensagem qualquer durante indisponibilidade','[]'::jsonb,false,'{"acao":"encaminhar_humano","motivo_handoff":"fora_escopo","mensagem_neutra":true}'::jsonb);