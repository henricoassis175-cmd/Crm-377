ALTER TYPE public.integration_kind RENAME VALUE 'openai' TO 'anthropic';
ALTER TABLE public.stores ALTER COLUMN ai_model SET DEFAULT 'claude-sonnet-4-5';
UPDATE public.stores SET ai_model = 'claude-sonnet-4-5' WHERE ai_model IS NULL OR ai_model LIKE 'gpt%';