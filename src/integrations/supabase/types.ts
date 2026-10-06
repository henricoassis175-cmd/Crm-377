export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_usage_logs: {
        Row: {
          conversation_id: string | null
          cost_estimate_cents: number | null
          created_at: string
          error_code: string | null
          id: string
          input_tokens: number
          latency_ms: number | null
          model: string
          output_tokens: number
          source: string
          status: string
          store_id: string
        }
        Insert: {
          conversation_id?: string | null
          cost_estimate_cents?: number | null
          created_at?: string
          error_code?: string | null
          id?: string
          input_tokens?: number
          latency_ms?: number | null
          model: string
          output_tokens?: number
          source?: string
          status?: string
          store_id: string
        }
        Update: {
          conversation_id?: string | null
          cost_estimate_cents?: number | null
          created_at?: string
          error_code?: string | null
          id?: string
          input_tokens?: number
          latency_ms?: number | null
          model?: string
          output_tokens?: number
          source?: string
          status?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_logs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          metadata: Json
          store_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
          store_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
          store_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_items: {
        Row: {
          available: boolean
          battery_health: number | null
          color: string | null
          condition: Database["public"]["Enums"]["item_condition"]
          created_at: string
          deleted_at: string | null
          id: string
          model: string
          notes: string | null
          price_cents: number
          stock: number
          storage: string
          store_id: string
          updated_at: string
        }
        Insert: {
          available?: boolean
          battery_health?: number | null
          color?: string | null
          condition: Database["public"]["Enums"]["item_condition"]
          created_at?: string
          deleted_at?: string | null
          id?: string
          model: string
          notes?: string | null
          price_cents: number
          stock?: number
          storage: string
          store_id: string
          updated_at?: string
        }
        Update: {
          available?: boolean
          battery_health?: number | null
          color?: string | null
          condition?: Database["public"]["Enums"]["item_condition"]
          created_at?: string
          deleted_at?: string | null
          id?: string
          model?: string
          notes?: string | null
          price_cents?: number
          stock?: number
          storage?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_items_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          id: string
          instagram: string | null
          kommo_contact_id: string
          name: string | null
          phone: string | null
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          instagram?: string | null
          kommo_contact_id: string
          name?: string | null
          phone?: string | null
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          instagram?: string | null
          kommo_contact_id?: string
          name?: string | null
          phone?: string | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          bot_active: boolean
          channel: Database["public"]["Enums"]["channel_kind"]
          created_at: string
          id: string
          kommo_conversation_id: string
          last_message_at: string | null
          lead_id: string | null
          store_id: string
          updated_at: string
        }
        Insert: {
          bot_active?: boolean
          channel?: Database["public"]["Enums"]["channel_kind"]
          created_at?: string
          id?: string
          kommo_conversation_id: string
          last_message_at?: string | null
          lead_id?: string | null
          store_id: string
          updated_at?: string
        }
        Update: {
          bot_active?: boolean
          channel?: Database["public"]["Enums"]["channel_kind"]
          created_at?: string
          id?: string
          kommo_conversation_id?: string
          last_message_at?: string | null
          lead_id?: string | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      handoffs: {
        Row: {
          actions_applied: Json
          assigned_to: string | null
          conversation_id: string | null
          created_at: string
          id: string
          lead_id: string | null
          reason: Database["public"]["Enums"]["handoff_reason"]
          resolved_at: string | null
          status: Database["public"]["Enums"]["handoff_status"]
          store_id: string
          target: string | null
          updated_at: string
        }
        Insert: {
          actions_applied?: Json
          assigned_to?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          reason: Database["public"]["Enums"]["handoff_reason"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["handoff_status"]
          store_id: string
          target?: string | null
          updated_at?: string
        }
        Update: {
          actions_applied?: Json
          assigned_to?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          reason?: Database["public"]["Enums"]["handoff_reason"]
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["handoff_status"]
          store_id?: string
          target?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "handoffs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handoffs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handoffs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_events: {
        Row: {
          created_at: string
          detail: Json
          event_type: string
          id: string
          kind: Database["public"]["Enums"]["integration_kind"]
          latency_ms: number | null
          store_id: string | null
          success: boolean
        }
        Insert: {
          created_at?: string
          detail?: Json
          event_type: string
          id?: string
          kind: Database["public"]["Enums"]["integration_kind"]
          latency_ms?: number | null
          store_id?: string | null
          success?: boolean
        }
        Update: {
          created_at?: string
          detail?: Json
          event_type?: string
          id?: string
          kind?: Database["public"]["Enums"]["integration_kind"]
          latency_ms?: number | null
          store_id?: string | null
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "integration_events_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_settings: {
        Row: {
          config: Json
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["integration_kind"]
          last_test_result: string | null
          last_tested_at: string | null
          status: Database["public"]["Enums"]["integration_status"]
          store_id: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["integration_kind"]
          last_test_result?: string | null
          last_tested_at?: string | null
          status?: Database["public"]["Enums"]["integration_status"]
          store_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["integration_kind"]
          last_test_result?: string | null
          last_tested_at?: string | null
          status?: Database["public"]["Enums"]["integration_status"]
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_versions: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["version_status"]
          store_id: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["version_status"]
          store_id?: string | null
          title?: string
          updated_at?: string
          version: number
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["version_status"]
          store_id?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_versions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          contact_id: string | null
          created_at: string
          id: string
          kommo_lead_id: string
          last_action: Database["public"]["Enums"]["agent_action"] | null
          last_message_at: string | null
          stage: Database["public"]["Enums"]["lead_stage"]
          store_id: string
          temperature: Database["public"]["Enums"]["lead_temperature"]
          updated_at: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          id?: string
          kommo_lead_id: string
          last_action?: Database["public"]["Enums"]["agent_action"] | null
          last_message_at?: string | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          store_id: string
          temperature?: Database["public"]["Enums"]["lead_temperature"]
          updated_at?: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          id?: string
          kommo_lead_id?: string
          last_action?: Database["public"]["Enums"]["agent_action"] | null
          last_message_at?: string | null
          stage?: Database["public"]["Enums"]["lead_stage"]
          store_id?: string
          temperature?: Database["public"]["Enums"]["lead_temperature"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          action: Database["public"]["Enums"]["agent_action"] | null
          content: string
          conversation_id: string
          created_at: string
          event_id: string | null
          id: string
          latency_ms: number | null
          role: Database["public"]["Enums"]["message_role"]
          stage: Database["public"]["Enums"]["lead_stage"] | null
          store_id: string
          temperature: Database["public"]["Enums"]["lead_temperature"] | null
        }
        Insert: {
          action?: Database["public"]["Enums"]["agent_action"] | null
          content: string
          conversation_id: string
          created_at?: string
          event_id?: string | null
          id?: string
          latency_ms?: number | null
          role: Database["public"]["Enums"]["message_role"]
          stage?: Database["public"]["Enums"]["lead_stage"] | null
          store_id: string
          temperature?: Database["public"]["Enums"]["lead_temperature"] | null
        }
        Update: {
          action?: Database["public"]["Enums"]["agent_action"] | null
          content?: string
          conversation_id?: string
          created_at?: string
          event_id?: string | null
          id?: string
          latency_ms?: number | null
          role?: Database["public"]["Enums"]["message_role"]
          stage?: Database["public"]["Enums"]["lead_stage"] | null
          store_id?: string
          temperature?: Database["public"]["Enums"]["lead_temperature"] | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          job_title: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prompt_versions: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          published_at: string | null
          status: Database["public"]["Enums"]["version_status"]
          store_id: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["version_status"]
          store_id?: string | null
          title?: string
          updated_at?: string
          version: number
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          published_at?: string | null
          status?: Database["public"]["Enums"]["version_status"]
          store_id?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_versions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_members: {
        Row: {
          created_at: string
          id: string
          store_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          store_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_members_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          about: string | null
          active: boolean
          agent_name: string
          agent_paused: boolean
          ai_model: string
          created_at: string
          default_responsible_user_id: string | null
          deleted_at: string | null
          handoff_add_note: boolean
          handoff_assign_user: boolean
          handoff_move_stage: boolean
          handoff_stop_bot: boolean
          handoff_target: string | null
          id: string
          kommo_account_id: string | null
          kommo_human_stage_id: string | null
          kommo_pipeline_id: string | null
          kommo_subdomain: string | null
          price_integration_enabled: boolean
          price_source: Database["public"]["Enums"]["price_source"]
          reveal_virtual: boolean
          store_id: string
          store_name: string
          updated_at: string
        }
        Insert: {
          about?: string | null
          active?: boolean
          agent_name?: string
          agent_paused?: boolean
          ai_model?: string
          created_at?: string
          default_responsible_user_id?: string | null
          deleted_at?: string | null
          handoff_add_note?: boolean
          handoff_assign_user?: boolean
          handoff_move_stage?: boolean
          handoff_stop_bot?: boolean
          handoff_target?: string | null
          id?: string
          kommo_account_id?: string | null
          kommo_human_stage_id?: string | null
          kommo_pipeline_id?: string | null
          kommo_subdomain?: string | null
          price_integration_enabled?: boolean
          price_source?: Database["public"]["Enums"]["price_source"]
          reveal_virtual?: boolean
          store_id: string
          store_name: string
          updated_at?: string
        }
        Update: {
          about?: string | null
          active?: boolean
          agent_name?: string
          agent_paused?: boolean
          ai_model?: string
          created_at?: string
          default_responsible_user_id?: string | null
          deleted_at?: string | null
          handoff_add_note?: boolean
          handoff_assign_user?: boolean
          handoff_move_stage?: boolean
          handoff_stop_bot?: boolean
          handoff_target?: string | null
          id?: string
          kommo_account_id?: string | null
          kommo_human_stage_id?: string | null
          kommo_pipeline_id?: string | null
          kommo_subdomain?: string | null
          price_integration_enabled?: boolean
          price_source?: Database["public"]["Enums"]["price_source"]
          reveal_virtual?: boolean
          store_id?: string
          store_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      test_runs: {
        Row: {
          created_at: string
          created_by: string | null
          expected: Json
          failures: Json
          id: string
          input_message: string
          latency_ms: number | null
          obtained: Json
          passed: boolean
          price_enabled: boolean
          scenario_id: string | null
          store_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expected?: Json
          failures?: Json
          id?: string
          input_message: string
          latency_ms?: number | null
          obtained?: Json
          passed?: boolean
          price_enabled?: boolean
          scenario_id?: string | null
          store_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expected?: Json
          failures?: Json
          id?: string
          input_message?: string
          latency_ms?: number | null
          obtained?: Json
          passed?: boolean
          price_enabled?: boolean
          scenario_id?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_runs_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "test_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_runs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      test_scenarios: {
        Row: {
          code: string
          created_at: string
          description: string | null
          expected: Json
          history: Json
          id: string
          input_message: string
          price_enabled: boolean
          store_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          expected?: Json
          history?: Json
          id?: string
          input_message: string
          price_enabled?: boolean
          store_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          expected?: Json
          history?: Json
          id?: string
          input_message?: string
          price_enabled?: boolean
          store_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_scenarios_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_inbox: {
        Row: {
          created_at: string
          error: string | null
          event_id: string
          id: string
          payload: Json
          processed: boolean
          processed_at: string | null
          source: string
          store_id: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          event_id: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          source?: string
          store_id?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          event_id?: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          source?: string
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_inbox_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_store: { Args: { _store: string }; Returns: boolean }
      can_write_store: { Args: { _store: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      agent_action: "conversar" | "passar_preco" | "encaminhar_humano"
      app_role: "admin" | "gestor" | "operador"
      channel_kind: "whatsapp" | "instagram" | "outro"
      handoff_reason:
        | "sinal_fechamento"
        | "troca"
        | "insistencia_preco"
        | "pedido_humano"
        | "fora_escopo"
        | "falha_tecnica"
      handoff_status: "pendente" | "em_atendimento" | "concluido" | "cancelado"
      integration_kind: "supabase" | "n8n" | "kommo" | "anthropic"
      integration_status: "nao_configurado" | "configurado" | "testado"
      item_condition: "lacrado" | "novo" | "seminovo" | "vitrine"
      lead_stage:
        | "abertura"
        | "desenvolvimento"
        | "ancoragem"
        | "pre_fechamento"
        | "handoff"
      lead_temperature: "fria" | "morna" | "quente"
      message_role: "cliente" | "agente" | "humano" | "sistema"
      price_source: "manual" | "api_externa"
      version_status: "rascunho" | "publicado" | "arquivado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_action: ["conversar", "passar_preco", "encaminhar_humano"],
      app_role: ["admin", "gestor", "operador"],
      channel_kind: ["whatsapp", "instagram", "outro"],
      handoff_reason: [
        "sinal_fechamento",
        "troca",
        "insistencia_preco",
        "pedido_humano",
        "fora_escopo",
        "falha_tecnica",
      ],
      handoff_status: ["pendente", "em_atendimento", "concluido", "cancelado"],
      integration_kind: ["supabase", "n8n", "kommo", "anthropic"],
      integration_status: ["nao_configurado", "configurado", "testado"],
      item_condition: ["lacrado", "novo", "seminovo", "vitrine"],
      lead_stage: [
        "abertura",
        "desenvolvimento",
        "ancoragem",
        "pre_fechamento",
        "handoff",
      ],
      lead_temperature: ["fria", "morna", "quente"],
      message_role: ["cliente", "agente", "humano", "sistema"],
      price_source: ["manual", "api_externa"],
      version_status: ["rascunho", "publicado", "arquivado"],
    },
  },
} as const