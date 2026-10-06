import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/painel/documentacao")({
  head: () => ({
    meta: [
      { title: "Documentação | CRM 377" },
      {
        name: "description",
        content:
          "Arquitetura, contrato do agente, fluxo n8n e checklist de credenciais do CRM 377.",
      },
      { property: "og:title", content: "Documentação | CRM 377" },
      { property: "og:description", content: "Como operar e integrar o agente comercial 377." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DocPage,
});

const Bloco = ({ children }: { children: string }) => (
  <pre className="overflow-x-auto rounded-lg border border-border bg-background p-3 font-mono text-[11px] leading-relaxed">
    {children}
  </pre>
);

function DocPage() {
  return (
    <AppShell
      title="Documentação"
      description="Referência operacional do CRM 377 - Agente Comercial."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-surface lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Arquitetura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Cliente conversa por WhatsApp ou Instagram dentro do Kommo. O Salesbot dispara um
              <strong className="text-foreground"> widget_request</strong> para o n8n. O webhook
              responde HTTP 200 em até ~2 segundos e continua o processamento de forma assíncrona,
              devolvendo a resposta pela
              <strong className="text-foreground"> return_url</strong>.
            </p>
            <p>
              O n8n lê no banco a configuração da loja, o catálogo disponível e os últimos 10 a 15
              turnos da conversa, monta o system prompt (prompt publicado + conhecimento publicado),
              chama a Anthropic (Messages API), faz o parse estrito do JSON, persiste mensagens
              e métricas, responde ao Kommo e executa o handoff conforme as ações ligadas na loja.
            </p>
            <p>
              Este painel é a camada de controle: catálogo, cérebro, configuração, observabilidade e
              testes. Ele não substitui o n8n como orquestrador. Segredos ficam apenas nos secrets
              do backend.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-base">Contrato de entrada (Kommo → n8n)</CardTitle>
          </CardHeader>
          <CardContent>
            <Bloco>{`{
  "store_id": "loja-piloto",
  "contact_id": "123",
  "lead_id": "456",
  "conversation_id": "789",
  "message_text": "quanto custa o iPhone 13?",
  "channel": "whatsapp",
  "event_id": "kommo-evt-0001",
  "return_url": "https://<subdominio>.kommo.com/..."
}`}</Bloco>
            <p className="mt-2 text-xs text-muted-foreground">
              O event_id garante idempotência (tabela webhook_inbox). A return_url só é aceita em
              HTTPS e em domínio Kommo.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-base">Contrato de saída (Claude → sistema)</CardTitle>
          </CardHeader>
          <CardContent>
            <Bloco>{`{
  "resposta": "texto enviado ao cliente",
  "temperatura_lead": "fria | morna | quente",
  "estagio": "abertura | desenvolvimento | ancoragem | pre_fechamento | handoff",
  "acao": "conversar | passar_preco | encaminhar_humano",
  "motivo_handoff": null
}`}</Bloco>
            <p className="mt-2 text-xs text-muted-foreground">
              Parse tolerante remove crases e texto extra. Enum inválido, JSON quebrado ou campo
              faltando cai no fallback: mensagem neutra + encaminhar humano.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-base">Regras invioláveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Preço somente do catálogo da loja. Sem item disponível, não se informa valor.</p>
            <p>2. Nada de promessa de prazo, garantia ou condição fora do que está cadastrado.</p>
            <p>
              3. Sinal de fechamento, troca, insistência em preço, pedido de humano ou tema fora do
              escopo geram handoff.
            </p>
            <p>4. Falha técnica também gera handoff, com mensagem neutra ao cliente.</p>
            <p>
              5. Nenhum segredo aparece no front-end, no banco legível, em logs ou no repositório.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle className="text-base">Fluxo n8n sugerido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Webhook (POST) → responder 200 imediatamente.</p>
            <p>2. Registrar em webhook_inbox; se event_id já existe, encerrar.</p>
            <p>
              3. Buscar loja, prompt publicado, conhecimento publicado, catálogo disponível e
              histórico recente.
            </p>
            <p>4. Chamar a Anthropic (Messages API) com o bloco de system da loja.</p>
            <p>5. Parse estrito + fallback.</p>
            <p>6. Persistir mensagem, temperatura, estágio, ação e latência.</p>
            <p>7. POST na return_url com a resposta.</p>
            <p>
              8. Se ação = encaminhar_humano, aplicar as ações ligadas na loja e criar registro em
              handoffs.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Webhook público idempotente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Rota do painel para receber o <code>widget_request</code> do Kommo (ou o repasse do
              n8n). Autenticada por token de serviço, valida a <code>return_url</code> contra o
              subdomínio Kommo da loja, grava em <code>webhook_inbox</code> com{" "}
              <code>event_id</code> único (reenvio devolve <code>duplicado: true</code>) e repassa
              ao n8n de forma assíncrona, respondendo em menos de 2s.
            </p>
            <Bloco>{`POST /api/public/agente/kommo
Authorization: Bearer <CRM377_WEBHOOK_SECRET>
Content-Type: application/json

{
  "store_id": "loja-piloto",
  "event_id": "kommo-98761",
  "message_text": "Quanto está o iPhone 13 128GB?",
  "return_url": "https://SEU-SUBDOMINIO.kommo.com/api/v4/salesbot/...",
  "contact_id": "1001",
  "lead_id": "2002",
  "conversation_id": "3003",
  "channel": "whatsapp"
}`}</Bloco>
            <p>
              O segredo <code>CRM377_WEBHOOK_SECRET</code> já está gerado nos secrets do backend;
              configure-o como header no Kommo/n8n.
            </p>
            <p>
              Fluxo n8n de referência:{" "}
              <a
                href="/n8n/crm377-agente.json"
                download
                className="font-medium text-primary underline underline-offset-4"
              >
                baixar crm377-agente.json
              </a>{" "}
              e importar no n8n. Ajuste as credenciais de Postgres e Anthropic dentro do próprio n8n
              — nenhuma chave fica neste painel.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Dependências de credenciais reais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {[
              [
                "Kommo",
                "Subdomínio, pipeline, etapa de atendimento humano, usuário responsável e token da integração (guardado no n8n).",
              ],
              [
                "n8n",
                "URL do webhook de produção e credencial de serviço para leitura/escrita no banco.",
              ],
              [
                "Anthropic (Claude)",
                "ANTHROPIC_API_KEY nos secrets do backend, usada pelo n8n e pelo laboratório. Modelo padrão claude-sonnet-4-5.",
              ],
              ["Banco", "Já provisionado por este projeto, com RLS ativa por loja."],
            ].map(([nome, desc]) => (
              <div key={nome} className="flex gap-3">
                <Badge variant="outline" className="h-fit">
                  {nome}
                </Badge>
                <span>{desc}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}