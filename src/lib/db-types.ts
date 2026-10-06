// Tipos das entidades do banco existente do CRM 377.
// IMPORTANTE: ao conectar o Supabase existente, alinhe estes tipos com o schema real.

export type AppRole = "admin" | "gestor" | "operador";
export type Temperatura = "fria" | "morna" | "quente";
export type Estagio = "abertura" | "desenvolvimento" | "ancoragem" | "pre_fechamento" | "handoff";
export type Acao = "conversar" | "passar_preco" | "encaminhar_humano";
export type MotivoHandoff =
  | "sinal_fechamento"
  | "troca"
  | "insistencia_preco"
  | "pedido_humano"
  | "fora_escopo"
  | "falha_tecnica";
export type Channel = "whatsapp" | "instagram" | "outro";
export type HandoffStatus = "pendente" | "em_atendimento" | "concluido";
export type IntegrationStatus = "nao_configurado" | "configurado" | "testado";
export type IntegrationProvider = "supabase" | "n8n" | "kommo" | "anthropic";
export type VersionStatus = "rascunho" | "publicado" | "arquivado";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type UserRole = { id: string; user_id: string; role: AppRole };

export type Store = {
  id: string;
  store_id: string;
  store_name: string;
  agent_name: string | null;
  about: string | null;
  reveal_virtual: boolean;
  price_source: "manual" | "api_externa";
  price_integration_enabled: boolean;
  kommo_subdomain: string | null;
  kommo_account_id: string | null;
  ai_model: string;
  agent_paused: boolean;
  kommo_pipeline_id: string | null;
  kommo_human_stage_id: string | null;
  default_responsible_user_id: string | null;
  handoff_target: string | null;
  handoff_stop_bot: boolean;
  handoff_assign_user: boolean;
  handoff_move_stage: boolean;
  handoff_add_note: boolean;
  active: boolean;
  deleted_at: string | null;
  created_at: string;
};

export type StoreMember = { id: string; store_id: string; user_id: string; role: AppRole };

export type Contact = {
  id: string;
  store_id: string;
  name: string | null;
  phone: string | null;
  instagram: string | null;
  kommo_contact_id: string | null;
  created_at: string;
};

export type Lead = {
  id: string;
  store_id: string;
  contact_id: string | null;
  kommo_lead_id: string | null;
  temperatura: Temperatura | null;
  estagio: Estagio | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  active: boolean;
  created_at: string;
};

export type Conversation = {
  id: string;
  store_id: string;
  lead_id: string | null;
  contact_id: string | null;
  channel: Channel;
  created_at: string;
};

export type Message = {
  id: string;
  store_id: string;
  conversation_id: string;
  author: "cliente" | "agente" | "humano" | "sistema";
  content: string;
  latency_ms: number | null;
  created_at: string;
};

export type Handoff = {
  id: string;
  store_id: string;
  lead_id: string | null;
  contact_id: string | null;
  motivo: MotivoHandoff;
  status: HandoffStatus;
  responsible_user_id: string | null;
  origem: string | null;
  created_at: string;
};

export type CatalogItem = {
  id: string;
  store_id: string;
  name: string;
  sku: string | null;
  description: string | null;
  price: number | null;
  stock: number | null;
  active: boolean;
  created_at: string;
};

export type PromptVersion = {
  id: string;
  store_id: string;
  version: number;
  content: string;
  status: VersionStatus;
  created_by: string | null;
  published_at: string | null;
  created_at: string;
};

export type KnowledgeVersion = PromptVersion;

export type TestScenario = {
  id: string;
  store_id: string;
  name: string;
  message_text: string;
  expected_action: Acao | null;
  created_at: string;
};

export type TestRun = {
  id: string;
  store_id: string;
  scenario_id: string | null;
  message_text: string;
  raw_output: string | null;
  parsed_output: Record<string, unknown> | null;
  valid: boolean;
  validation_errors: string[] | null;
  latency_ms: number | null;
  created_by: string | null;
  created_at: string;
};

export type IntegrationSetting = {
  id: string;
  store_id: string | null;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  config: Record<string, unknown>;
  last_tested_at: string | null;
  last_test_ok: boolean | null;
  last_test_message: string | null;
  updated_at: string;
};

export type IntegrationEvent = {
  id: string;
  store_id: string | null;
  provider: IntegrationProvider;
  event_type: string;
  success: boolean;
  detail: string | null;
  created_at: string;
};

export type AiUsageLog = {
  id: string;
  store_id: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  latency_ms: number | null;
  cost_usd: number | null;
  created_at: string;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  store_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type WebhookInbox = {
  id: string;
  event_id: string;
  source: string;
  payload: Record<string, unknown>;
  processed: boolean;
  created_at: string;
};

type Table<R> = { Row: R; Insert: Partial<R>; Update: Partial<R>; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      user_roles: Table<UserRole>;
      stores: Table<Store>;
      store_members: Table<StoreMember>;
      contacts: Table<Contact>;
      leads: Table<Lead>;
      conversations: Table<Conversation>;
      messages: Table<Message>;
      handoffs: Table<Handoff>;
      catalog_items: Table<CatalogItem>;
      prompt_versions: Table<PromptVersion>;
      knowledge_versions: Table<KnowledgeVersion>;
      test_scenarios: Table<TestScenario>;
      test_runs: Table<TestRun>;
      integration_settings: Table<IntegrationSetting>;
      integration_events: Table<IntegrationEvent>;
      ai_usage_logs: Table<AiUsageLog>;
      audit_logs: Table<AuditLog>;
      webhook_inbox: Table<WebhookInbox>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};