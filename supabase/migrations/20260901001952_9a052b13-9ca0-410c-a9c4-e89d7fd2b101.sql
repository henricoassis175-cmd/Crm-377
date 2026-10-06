ALTER TYPE public.integration_kind RENAME VALUE 'anthropic' TO 'openai';

ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS kommo_account_id text,
  ADD COLUMN IF NOT EXISTS ai_model text NOT NULL DEFAULT 'gpt-5.6',
  ADD COLUMN IF NOT EXISTS agent_paused boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS stores_kommo_account_id_key
  ON public.stores (kommo_account_id) WHERE kommo_account_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  model text NOT NULL,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  latency_ms integer,
  status text NOT NULL DEFAULT 'ok',
  error_code text,
  cost_estimate_cents numeric(12,4),
  source text NOT NULL DEFAULT 'n8n',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_usage_logs_store_created_idx ON public.ai_usage_logs (store_id, created_at DESC);

GRANT SELECT, INSERT ON public.ai_usage_logs TO authenticated;
GRANT ALL ON public.ai_usage_logs TO service_role;

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_select" ON public.ai_usage_logs
  FOR SELECT TO authenticated USING (public.can_access_store(store_id));

CREATE POLICY "ai_usage_insert" ON public.ai_usage_logs
  FOR INSERT TO authenticated WITH CHECK (public.can_access_store(store_id));