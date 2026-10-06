# CRM 377 — Agente Comercial

Camada administrativa e operacional do agente comercial 377. O atendimento real acontece no
WhatsApp e no Instagram dentro do **Kommo**; o **n8n** orquestra o fluxo e a **Anthropic (Claude)**
é o cérebro. Este app controla catálogo, prompt, configuração, observabilidade e testes.

## Stack

React + TypeScript + Tailwind + shadcn/ui sobre TanStack Start, com backend Supabase
(banco, autenticação e RLS) e server functions para operações que tocam credenciais.

## Arquitetura do fluxo

1. Kommo Salesbot dispara `widget_request` para o webhook do n8n.
2. O webhook responde HTTP 200 em até ~2s e segue de forma assíncrona.
3. O n8n lê no banco: configuração da loja, prompt publicado, conhecimento publicado,
   catálogo disponível e os últimos 10–15 turnos.
4. Chama a Anthropic pela Messages API com o bloco de system da loja.
5. Faz parse estrito do JSON de saída, com fallback para mensagem neutra + handoff.
6. Persiste mensagens, temperatura, estágio, ação e latência.
7. Responde ao Kommo pela `return_url` (HTTPS, domínio Kommo).
8. Em `encaminhar_humano`, aplica as ações ligadas na loja e cria o registro de handoff.

O provedor de preço é isolado: hoje `manual` (catálogo). `api_externa` é extensão futura.

## Contrato de saída do agente

```json
{
  "resposta": "texto",
  "temperatura_lead": "fria | morna | quente",
  "estagio": "abertura | desenvolvimento | ancoragem | pre_fechamento | handoff",
  "acao": "conversar | passar_preco | encaminhar_humano",
  "motivo_handoff": null
}
```

Implementação compartilhada em `src/lib/agent-contract.ts` (parse tolerante, validação de enums,
allowlist de `return_url` e fallback).

## Telas

Login, Dashboard, Lojas, Catálogo, Cérebro (prompt e conhecimento versionados), Leads e conversas,
Handoffs, Laboratório, Integrações, Logs e auditoria, Usuários e Documentação.

## Banco

Tabelas: `profiles`, `stores`, `store_members`, `prompt_versions`, `knowledge_versions`,
`catalog_items`, `contacts`, `leads`, `conversations`, `messages`, `handoffs`,
`integration_settings`, `integration_events`, `audit_logs`, `test_scenarios`, `test_runs`
e `webhook_inbox` (idempotência por `event_id` único).

RLS: administrador tem acesso global; gestor e operador acessam apenas as lojas atribuídas em
`store_members`. Nada de negócio é legível anonimamente.

## Segurança

- Segredos ficam apenas nos secrets do backend e no n8n. Nunca no front-end, no banco legível,
  em `localStorage`, em logs ou no repositório.
- Logs e auditoria mascaram dados pessoais na exibição.
- Não existem usuários ou senhas fixas no código; o papel inicial é `operador`.

## Credenciais necessárias para operar de verdade

| Serviço   | O que falta                                                                  |
| --------- | ---------------------------------------------------------------------------- |
| Anthropic | `ANTHROPIC_API_KEY` nos secrets do backend (modelo padrão `claude-sonnet-4-5`) |
| n8n       | URL do webhook de produção + credencial de banco configurada dentro do n8n    |
| Kommo     | Subdomínio, pipeline, etapa de atendimento humano, responsável e token no n8n |

Enquanto essas credenciais não existirem, as integrações permanecem como "não configurado" ou
"configurado" — nunca "testado".