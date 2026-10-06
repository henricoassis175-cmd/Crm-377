import {
  Activity,
  BookOpen,
  Boxes,
  BrainCircuit,
  FlaskConical,
  Gauge,
  Handshake,
  LayoutGrid,
  MessagesSquare,
  Plug,
  ScrollText,
  Settings,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AppRole } from "./db-types";

export type NavPath =
  | "/painel"
  | "/painel/lojas"
  | "/painel/leads"
  | "/painel/handoffs"
  | "/painel/catalogo"
  | "/painel/cerebro"
  | "/painel/laboratorio"
  | "/painel/integracoes"
  | "/painel/consumo-ia"
  | "/painel/logs"
  | "/painel/usuarios"
  | "/painel/configuracoes"
  | "/painel/documentacao";

export type NavItem = {
  to: NavPath;
  label: string;
  description: string;
  icon: LucideIcon;
  group: "trabalho" | "sistema" | "outros";
  minRole: AppRole;
};

export const NAV: NavItem[] = [
  { to: "/painel", label: "Visão geral", description: "Central operacional do agente comercial", icon: LayoutGrid, group: "trabalho", minRole: "operador" },
  { to: "/painel/lojas", label: "Lojas", description: "Configuração das lojas e do agente por loja", icon: Store, group: "trabalho", minRole: "gestor" },
  { to: "/painel/leads", label: "Leads e conversas", description: "Leads do Kommo e histórico de mensagens", icon: MessagesSquare, group: "trabalho", minRole: "operador" },
  { to: "/painel/handoffs", label: "Handoffs", description: "Transferências para atendimento humano", icon: Handshake, group: "trabalho", minRole: "operador" },
  { to: "/painel/catalogo", label: "Catálogo e estoque", description: "Produtos, preços e estoque da loja", icon: Boxes, group: "trabalho", minRole: "gestor" },
  { to: "/painel/cerebro", label: "Agente de IA Vexa", description: "Prompt, conhecimento e modelo do Agente 377", icon: BrainCircuit, group: "sistema", minRole: "admin" },
  { to: "/painel/laboratorio", label: "Laboratório", description: "QA do agente sem passar pelo Kommo", icon: FlaskConical, group: "sistema", minRole: "gestor" },
  { to: "/painel/integracoes", label: "Integrações", description: "Supabase, n8n, Kommo e Anthropic", icon: Plug, group: "sistema", minRole: "admin" },
  { to: "/painel/consumo-ia", label: "Consumo de IA", description: "Requisições, tokens, latência e custo", icon: Gauge, group: "sistema", minRole: "gestor" },
  { to: "/painel/logs", label: "Logs e auditoria", description: "Trilha de auditoria das ações", icon: ScrollText, group: "sistema", minRole: "gestor" },
  { to: "/painel/usuarios", label: "Usuários", description: "Usuários, papéis e acesso por loja", icon: Users, group: "sistema", minRole: "admin" },
  { to: "/painel/configuracoes", label: "Configurações", description: "Preferências gerais do workspace", icon: Settings, group: "outros", minRole: "operador" },
  { to: "/painel/documentacao", label: "Central de ajuda", description: "Documentação operacional do CRM 377", icon: BookOpen, group: "outros", minRole: "operador" },
];

export const ACTIVITY_ICON = Activity;