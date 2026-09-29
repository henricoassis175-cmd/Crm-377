# CRM 377

Painel multi-loja para operação do agente comercial 377.

## Arquitetura definida

- Kommo: CRM e canais WhatsApp/Instagram de cada loja.
- n8n: orquestração, webhook e regras de fallback.
- OpenAI: cérebro do atendimento, chamado somente no backend.
- Supabase: autenticação, configuração das lojas, catálogo, histórico e auditoria.
- Lovable: visualização e evolução da interface conectada a este repositório.

## Desenvolvimento

```bash
npm install
npm run dev
```

O painel inicial usa dados de demonstração identificados na interface. Nenhuma integração é marcada como conectada sem teste real.

## Segurança

- Nunca adicionar `OPENAI_API_KEY`, tokens Kommo ou chaves `service_role` ao frontend.
- O navegador recebe apenas URL e chave publicável do Supabase.
- Todas as tabelas operacionais deverão usar `store_id` e RLS no banco.
