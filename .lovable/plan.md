# Redesign CRM 377 baseado no GitHub

## Objetivo
Portar fielmente o sistema visual e as interações do commit `84b13b5b5cbcea45019b4b5da3873bd784f04b8b` para o CRM real, preservando autenticação, permissões, lojas, dados, rotas e integrações.

## Implementação
- Substituir o tema escuro por tokens claros equivalentes à referência: canvas, superfícies, sidebar, bordas, texto, azul e verde; usar Inter/system, raios menores, sombras discretas e transições rápidas.
- Refazer o shell compartilhado com sidebar de 238px, switcher da loja atual, grupos de navegação compactos, busca rápida com `Ctrl/⌘ K`, rodapé de ajuda/conta e topbar de 51px.
- Implementar a navegação móvel com menu lateral deslizante, backdrop e fechamento por navegação, clique externo ou `Escape`.
- Adaptar a busca rápida para rotas reais e respeitar permissões administrativas; manter o seletor de loja ligado ao contexto e aos dados existentes.
- Recompor a Visão geral com dados reais: boas-vindas, ações, KPIs, distribuição por temperatura/estágio, saúde das integrações e atalhos, sem números demonstrativos.
- Atualizar os componentes compartilhados usados em todo o CRM: cards, botões, inputs, textareas, selects, badges, tabelas, tabs, menus, dialogs e sheets.
- Preservar todas as consultas e regras atuais; não alterar banco, autenticação ou integrações.

## Validação
- Conferir desktop e mobile no preview autenticado, incluindo sidebar, busca, seletor de loja e navegação entre páginas.
- Verificar rotas principais e ausência de erros de console/runtime.
- Confirmar o build automático e executar lint/testes disponíveis sem alterar dados reais.

## Detalhes técnicos
- A referência é usada somente como design system e UX; o projeto continua em TanStack Start, sem importar o `App.tsx` estático.
- Cores permanecerão centralizadas em tokens semânticos de `src/styles.css`.
- A estrutura das rotas, contexto de lojas e chamadas ao Lovable Cloud permanecerão intactas.