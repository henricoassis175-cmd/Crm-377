import type { ChecklistItem, Conversation, Integration } from "./types";

export const integrations: Integration[] = [
  {
    name: "Kommo",
    shortName: "K",
    description: "CRM e canais por loja",
    status: "Configuração pendente",
    detail: "OAuth ainda não validado",
    tone: "attention",
  },
  {
    name: "n8n",
    shortName: "n8",
    description: "Orquestração do atendimento",
    status: "Webhook registrado",
    detail: "Teste ponta a ponta pendente",
    tone: "online",
  },
  {
    name: "OpenAI",
    shortName: "AI",
    description: "Cérebro do agente 377",
    status: "Chave disponível",
    detail: "Validação no backend pendente",
    tone: "attention",
  },
  {
    name: "Supabase",
    shortName: "S",
    description: "Dados, autenticação e RLS",
    status: "Estrutura pendente",
    detail: "Banco ainda não conectado",
    tone: "neutral",
  },
];

export const conversations: Conversation[] = [
  {
    id: "#1048",
    customer: "Mariana Alves",
    initials: "MA",
    channel: "WhatsApp",
    lastMessage: "Quero saber as condições do iPhone 15 Pro...",
    stage: "Desenvolvimento",
    temperature: "Morna",
    time: "10:42",
  },
  {
    id: "#1047",
    customer: "Pedro Henrique",
    initials: "PH",
    channel: "Instagram",
    lastMessage: "Consigo dar meu aparelho como entrada?",
    stage: "Handoff humano",
    temperature: "Quente",
    time: "10:31",
  },
  {
    id: "#1046",
    customer: "Larissa Souza",
    initials: "LS",
    channel: "WhatsApp",
    lastMessage: "Qual a diferença do nacional para o americano?",
    stage: "Qualificação",
    temperature: "Fria",
    time: "10:18",
  },
  {
    id: "#1045",
    customer: "Rafael Lima",
    initials: "RL",
    channel: "WhatsApp",
    lastMessage: "Tem o 16 Pro Max disponível para retirada?",
    stage: "Pré-fechamento",
    temperature: "Quente",
    time: "09:56",
  },
];

export const checklist: ChecklistItem[] = [
  {
    label: "Base visual do painel",
    detail: "Dashboard responsivo e estrutura multi-loja",
    state: "done",
  },
  {
    label: "Banco e autenticação",
    detail: "Supabase, perfis, store_id e políticas RLS",
    state: "active",
  },
  {
    label: "Fluxo inteligente",
    detail: "Kommo → n8n → OpenAI → Kommo",
    state: "pending",
  },
  {
    label: "Handoff e laboratório",
    detail: "Transferência humana e testes controlados",
    state: "pending",
  },
];
