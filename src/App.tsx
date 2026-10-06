import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { checklist, conversations, integrations } from "./data";
import type { StatusTone } from "./types";

type IconName =
  | "home"
  | "store"
  | "chat"
  | "users"
  | "pipeline"
  | "box"
  | "bot"
  | "plug"
  | "chart"
  | "shield"
  | "search"
  | "bell"
  | "chevron"
  | "plus"
  | "arrow"
  | "command"
  | "sparkles"
  | "clock"
  | "check"
  | "menu"
  | "close"
  | "settings"
  | "more";

const iconPaths: Record<IconName, ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10M9.5 20v-6h5v6"/></>,
  store: <><path d="M4 9h16l-1.5-5h-13z"/><path d="M5 12v8h14v-8M9 20v-5h6v5"/><path d="M4 9c0 2 3 2 4 0 1 2 3 2 4 0 1 2 3 2 4 0 1 2 4 2 4 0"/></>,
  chat: <><path d="M20 15.5a3.5 3.5 0 0 1-3.5 3.5H8l-4.5 2.5V7.5A3.5 3.5 0 0 1 7 4h9.5A3.5 3.5 0 0 1 20 7.5z"/><path d="M8 9h8M8 13h5"/></>,
  users: <><path d="M15 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20"/><circle cx="8.5" cy="7.5" r="3.5"/><path d="M17 11a3.5 3.5 0 0 0 0-7M22 20v-1.5a4 4 0 0 0-3-3.7"/></>,
  pipeline: <><path d="M4 5h5v5H4zM15 14h5v5h-5z"/><path d="M9 7.5h3a5 5 0 0 1 5 5V14M7 10v7a2 2 0 0 0 2 2h6"/></>,
  box: <><path d="m4 7 8-4 8 4-8 4z"/><path d="M4 7v10l8 4 8-4V7M12 11v10"/></>,
  bot: <><rect x="4" y="6" width="16" height="13" rx="4"/><path d="M12 2v4M8 11h.01M16 11h.01M8 15h8"/></>,
  plug: <><path d="M8 3v5M16 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/></>,
  chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  chevron: <path d="m9 6 6 6-6 6"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  command: <><path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/></>,
  sparkles: <><path d="m12 3 1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63 1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9 1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15z"/></>,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  );
}

const workNavigation: Array<{ label: string; icon: IconName; badge?: string }> = [
  { label: "Visão geral", icon: "home" },
  { label: "Conversas", icon: "chat", badge: "12" },
  { label: "Leads", icon: "users" },
  { label: "Funil comercial", icon: "pipeline" },
  { label: "Catálogo e estoque", icon: "box" },
];

const systemNavigation: Array<{ label: string; icon: IconName }> = [
  { label: "Agente 377", icon: "bot" },
  { label: "Integrações", icon: "plug" },
  { label: "Relatórios", icon: "chart" },
  { label: "Auditoria", icon: "shield" },
];

const quickActions = [
  { title: "Abrir conversas", detail: "Acompanhar os atendimentos em andamento", icon: "chat" as IconName, target: "Conversas" },
  { title: "Ver leads quentes", detail: "Filtrar oportunidades próximas do handoff", icon: "users" as IconName, target: "Leads" },
  { title: "Checar integrações", detail: "Revisar Kommo, n8n, OpenAI e Supabase", icon: "plug" as IconName, target: "Integrações" },
  { title: "Abrir relatórios", detail: "Analisar volume e velocidade de atendimento", icon: "chart" as IconName, target: "Relatórios" },
];

function StatusDot({ tone }: { tone: StatusTone }) {
  return <span className={`status-dot status-${tone}`} aria-hidden="true" />;
}

function App() {
  const [active, setActive] = useState("Visão geral");
  const [period, setPeriod] = useState("Hoje");
  const [menuOpen, setMenuOpen] = useState(false);
  const [storeMenuOpen, setStoreMenuOpen] = useState(false);
  const [storeFilterOpen, setStoreFilterOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState("Todas as lojas");
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const commandInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((current) => !current);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setStoreMenuOpen(false);
        setStoreFilterOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (commandOpen) window.setTimeout(() => commandInputRef.current?.focus(), 80);
    else setCommandQuery("");
  }, [commandOpen]);

  const filteredActions = useMemo(() => {
    const normalized = commandQuery.trim().toLowerCase();
    if (!normalized) return quickActions;
    return quickActions.filter((action) => `${action.title} ${action.detail}`.toLowerCase().includes(normalized));
  }, [commandQuery]);

  const selectNavigation = (label: string) => {
    setActive(label);
    setMenuOpen(false);
    setCommandOpen(false);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="workspace-area">
          <button className="workspace-switcher" onClick={() => setStoreMenuOpen((value) => !value)} aria-expanded={storeMenuOpen}>
            <span className="brand-glyph">377</span>
            <span className="workspace-copy"><strong>CRM 377</strong><small>Vexa</small></span>
            <span className={`workspace-chevron ${storeMenuOpen ? "open" : ""}`}><Icon name="chevron" size={14} /></span>
          </button>
          <button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><Icon name="close" /></button>
          {storeMenuOpen && (
            <div className="workspace-popover surface-popover">
              <span>WORKSPACE ATUAL</span>
              <button className="selected"><b>377</b><div><strong>CRM 377</strong><small>Administração Vexa</small></div><Icon name="check" size={15} /></button>
              <button><span className="popover-plus"><Icon name="plus" size={14} /></span><div><strong>Adicionar workspace</strong><small>Disponível após o Supabase</small></div></button>
            </div>
          )}
        </div>

        <button className="quick-action" onClick={() => setCommandOpen(true)}>
          <Icon name="search" size={15} />
          <span>Busca rápida</span>
          <kbd>⌘K</kbd>
        </button>

        <nav className="primary-nav" aria-label="Navegação principal">
          <div className="nav-group">
            <span className="nav-label">TRABALHO</span>
            {workNavigation.map((item) => (
              <button key={item.label} className={active === item.label ? "active" : ""} onClick={() => selectNavigation(item.label)}>
                <Icon name={item.icon} size={17} />
                <span>{item.label}</span>
                {item.badge && <em>{item.badge}</em>}
              </button>
            ))}
          </div>
          <div className="nav-group">
            <span className="nav-label">SISTEMA</span>
            {systemNavigation.map((item) => (
              <button key={item.label} className={active === item.label ? "active" : ""} onClick={() => selectNavigation(item.label)}>
                <Icon name={item.icon} size={17} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="help-row"><span>?</span><div><strong>Central de ajuda</strong><small>Documentação do sistema</small></div></button>
          <button className="account-row">
            <span className="avatar">HB</span>
            <div><strong>Henrico Brandão</strong><small>Administrador Vexa</small></div>
            <Icon name="more" size={17} />
          </button>
        </div>
      </aside>

      {menuOpen && <button className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Icon name="menu" /></button>
            <span className="page-icon"><Icon name="home" size={15} /></span>
            <span className="topbar-title">{active}</span>
          </div>
          <div className="topbar-actions">
            <div className="store-filter-wrap">
              <button className="store-filter" onClick={() => setStoreFilterOpen((value) => !value)} aria-expanded={storeFilterOpen}>
                {selectedStore}<span className={storeFilterOpen ? "open" : ""}>⌄</span>
              </button>
              {storeFilterOpen && (
                <div className="store-filter-menu surface-popover">
                  {["Todas as lojas", "Loja Centro", "Loja Norte"].map((store) => (
                    <button
                      key={store}
                      className={selectedStore === store ? "selected" : ""}
                      onClick={() => { setSelectedStore(store); setStoreFilterOpen(false); }}
                    >
                      <span>{store}</span>
                      {selectedStore === store && <Icon name="check" size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="toolbar-button" aria-label="Configurações"><Icon name="settings" size={16} /></button>
            <button className="toolbar-button notification-button" aria-label="Notificações"><Icon name="bell" size={16} /><span /></button>
          </div>
        </header>

        <div className="page-canvas">
          <section className="welcome-section reveal reveal-1">
            <div className="welcome-heading">
              <div>
                <span className="eyebrow">CENTRAL DE OPERAÇÕES</span>
                <h1>Bom dia, Henrico</h1>
                <p>Uma visão clara do que está acontecendo agora no atendimento comercial.</p>
              </div>
              <button className="primary-button" onClick={() => setCommandOpen(true)}><Icon name="plus" size={15} /> Nova ação</button>
            </div>

            <button className="command-bar" onClick={() => setCommandOpen(true)}>
              <span className="command-symbol"><Icon name="sparkles" size={17} /></span>
              <span>O que precisa da sua atenção hoje?</span>
              <span className="command-shortcut"><Icon name="command" size={12} /> K</span>
              <span className="command-submit"><Icon name="arrow" size={15} /></span>
            </button>
            <div className="suggestion-row">
              <span>Sugestões</span>
              <button onClick={() => selectNavigation("Conversas")}>Conversas abertas</button>
              <button onClick={() => selectNavigation("Leads")}>Leads quentes</button>
              <button onClick={() => selectNavigation("Integrações")}>Saúde das integrações</button>
            </div>
          </section>

          <section className="metrics-surface reveal reveal-2">
            <div className="surface-header">
              <div><span className="eyebrow">DESEMPENHO</span><h2>Resumo comercial</h2></div>
              <div className={`segmented-control segmented-${period === "Hoje" ? "today" : period === "7 dias" ? "week" : "month"}`}>{["Hoje", "7 dias", "30 dias"].map((item) => <button key={item} className={period === item ? "selected" : ""} onClick={() => setPeriod(item)}>{item}</button>)}</div>
            </div>
            <div className="metrics-row">
              <article><span>Novos leads</span><strong>{period === "Hoje" ? "48" : period === "7 dias" ? "284" : "1.126"}</strong><small className="positive">↑ 12,5%</small></article>
              <article><span>Atendidos pela IA</span><strong>{period === "Hoje" ? "39" : period === "7 dias" ? "237" : "948"}</strong><small>81,3% do total</small></article>
              <article><span>Handoffs humanos</span><strong>{period === "Hoje" ? "9" : period === "7 dias" ? "47" : "178"}</strong><small>23,1% dos atendimentos</small></article>
              <article><span>Primeira resposta</span><strong>8s</strong><small className="positive">↓ 3s mais rápido</small></article>
            </div>
            <div className="data-note"><span /> Dados demonstrativos até as integrações entrarem em produção.</div>
          </section>

          <div className="dashboard-grid reveal reveal-3">
            <section className="data-surface conversations-surface">
              <div className="surface-header table-header">
                <div><span className="eyebrow">TEMPO REAL</span><h2>Conversas recentes</h2></div>
                <button className="secondary-button" onClick={() => selectNavigation("Conversas")}>Ver todas <Icon name="arrow" size={14} /></button>
              </div>
              <div className="table-columns"><span>Contato</span><span>Canal</span><span>Etapa</span><span>Status</span><span>Horário</span></div>
              <div className="conversation-list">
                {conversations.map((conversation) => (
                  <button className="conversation-row" key={conversation.id} onClick={() => selectNavigation("Conversas")}>
                    <span className="contact-cell"><i>{conversation.initials}</i><span><strong>{conversation.customer}</strong><small>{conversation.lastMessage}</small></span></span>
                    <span className="channel-cell">{conversation.channel}</span>
                    <span className="stage-cell">{conversation.stage}</span>
                    <span><b className={`temperature temperature-${conversation.temperature.toLowerCase()}`}>{conversation.temperature}</b></span>
                    <time>{conversation.time}</time>
                  </button>
                ))}
              </div>
            </section>

            <section className="data-surface integration-surface">
              <div className="surface-header">
                <div><span className="eyebrow">INFRAESTRUTURA</span><h2>Saúde do sistema</h2></div>
                <button className="icon-ghost" onClick={() => selectNavigation("Integrações")} aria-label="Abrir integrações"><Icon name="more" size={17} /></button>
              </div>
              <div className="integration-list">
                {integrations.map((integration) => (
                  <button key={integration.name} onClick={() => selectNavigation("Integrações")}>
                    <span className="integration-monogram">{integration.shortName}</span>
                    <span className="integration-info"><strong>{integration.name}</strong><small>{integration.detail}</small></span>
                    <span className="integration-state"><StatusDot tone={integration.tone} /><small>{integration.status}</small></span>
                    <Icon name="chevron" size={14} />
                  </button>
                ))}
              </div>
              <button className="integration-footer" onClick={() => selectNavigation("Integrações")}><span><Icon name="shield" size={15} /> Segurança multi-loja por <code>store_id</code></span><Icon name="arrow" size={14} /></button>
            </section>
          </div>

          <section className="implementation-surface reveal reveal-4">
            <div className="surface-header implementation-header">
              <div><span className="eyebrow">IMPLANTAÇÃO</span><h2>Preparação do ambiente</h2><p>Da interface até o primeiro atendimento real.</p></div>
              <div className="implementation-progress"><strong>25%</strong><span><i /></span></div>
            </div>
            <div className="implementation-grid">
              {checklist.map((item, index) => (
                <button className={`implementation-item implementation-${item.state}`} key={item.label}>
                  <span className="step-marker">{item.state === "done" ? <Icon name="check" size={14} /> : index + 1}</span>
                  <span><strong>{item.label}</strong><small>{item.detail}</small></span>
                  <span className="step-state">{item.state === "done" ? "Concluído" : item.state === "active" ? "Em andamento" : "Pendente"}</span>
                  <Icon name="chevron" size={14} />
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      {commandOpen && (
        <div className="command-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setCommandOpen(false); }}>
          <div className="command-dialog" role="dialog" aria-modal="true" aria-label="Busca rápida">
            <div className="command-input-row"><Icon name="search" size={18} /><input ref={commandInputRef} value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} placeholder="Buscar ou executar uma ação..." /><kbd>Esc</kbd></div>
            <div className="command-results">
              <span className="command-group-label">AÇÕES RÁPIDAS</span>
              {filteredActions.map((action, index) => (
                <button key={action.title} onClick={() => selectNavigation(action.target)}>
                  <span className="result-icon"><Icon name={action.icon} size={16} /></span>
                  <span><strong>{action.title}</strong><small>{action.detail}</small></span>
                  {index === 0 && !commandQuery && <kbd>↵</kbd>}
                  <Icon name="chevron" size={14} />
                </button>
              ))}
              {filteredActions.length === 0 && <div className="command-empty">Nenhuma ação encontrada para “{commandQuery}”.</div>}
            </div>
            <div className="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> navegar</span><span><kbd>↵</kbd> selecionar</span><span><kbd>esc</kbd> fechar</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
