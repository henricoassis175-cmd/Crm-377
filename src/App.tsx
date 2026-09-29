import { useMemo, useState, type ReactNode } from "react";
import { checklist, conversations, integrations } from "./data";
import type { StatusTone } from "./types";

type IconName =
  | "grid"
  | "store"
  | "chat"
  | "box"
  | "users"
  | "bot"
  | "plug"
  | "chart"
  | "shield"
  | "search"
  | "bell"
  | "arrow"
  | "sparkles"
  | "clock"
  | "check"
  | "menu"
  | "close";

const iconPaths: Record<IconName, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
  store: <><path d="M3 9l2-5h14l2 5"/><path d="M5 13v8h14v-8"/><path d="M9 21v-6h6v6"/><path d="M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0"/></>,
  chat: <><path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4z"/><path d="M8 9h8M8 13h5"/></>,
  box: <><path d="M21 8l-9 5-9-5 9-5z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/></>,
  users: <><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>,
  bot: <><rect x="4" y="6" width="16" height="13" rx="4"/><path d="M12 2v4M8 11h.01M16 11h.01M8 15h8"/></>,
  plug: <><path d="M12 22v-5M9 8V2M15 8V2M18 8v4a6 6 0 01-12 0V8z"/></>,
  chart: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></>,
  bell: <><path d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  sparkles: <><path d="M12 3l1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8zM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8z"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  check: <path d="M5 12l4 4L19 6"/>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  close: <path d="M6 6l12 12M18 6L6 18"/>,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  );
}

const navigation: Array<{ label: string; icon: IconName }> = [
  { label: "Visão geral", icon: "grid" },
  { label: "Lojas", icon: "store" },
  { label: "Conversas", icon: "chat" },
  { label: "Catálogo e estoque", icon: "box" },
  { label: "Equipe", icon: "users" },
  { label: "Agente de IA", icon: "bot" },
  { label: "Integrações", icon: "plug" },
  { label: "Relatórios", icon: "chart" },
  { label: "Auditoria", icon: "shield" },
];

function StatusDot({ tone }: { tone: StatusTone }) {
  return <span className={`status-dot status-${tone}`} />;
}

function App() {
  const [active, setActive] = useState("Visão geral");
  const [period, setPeriod] = useState("Hoje");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visibleConversations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return conversations;
    return conversations.filter((conversation) =>
      [conversation.customer, conversation.channel, conversation.stage, conversation.lastMessage]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  const selectNavigation = (label: string) => {
    setActive(label);
    setMenuOpen(false);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><span>3</span><span>7</span><span>7</span></div>
          <div>
            <strong>CRM 377</strong>
            <small>Inteligência comercial</small>
          </div>
          <button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Fechar menu"><Icon name="close" /></button>
        </div>

        <div className="workspace-card">
          <div className="workspace-logo">VX</div>
          <div>
            <span>Workspace</span>
            <strong>Vexa • Admin</strong>
          </div>
          <span className="chevron">⌄</span>
        </div>

        <nav className="primary-nav" aria-label="Navegação principal">
          <span className="nav-eyebrow">OPERAÇÃO</span>
          {navigation.slice(0, 6).map((item) => (
            <button key={item.label} className={active === item.label ? "active" : ""} onClick={() => selectNavigation(item.label)}>
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
              {item.label === "Conversas" && <span className="nav-count">12</span>}
            </button>
          ))}
          <span className="nav-eyebrow nav-section">GESTÃO</span>
          {navigation.slice(6).map((item) => (
            <button key={item.label} className={active === item.label ? "active" : ""} onClick={() => selectNavigation(item.label)}>
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="environment-line"><span className="live-dot" /> Ambiente de desenvolvimento</div>
          <small>Base inicial • v0.1.0</small>
        </div>
      </aside>

      {menuOpen && <button className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" />}

      <main className="main-content">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Icon name="menu" /></button>
          <div className="breadcrumb"><span>CRM 377</span><b>/</b><strong>{active}</strong></div>
          <div className="top-actions">
            <label className="search-box">
              <Icon name="search" size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar conversas..." aria-label="Buscar conversas" />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button" aria-label="Notificações"><Icon name="bell" size={19} /><span className="notification-dot" /></button>
            <div className="profile"><div className="avatar">HB</div><div><strong>Henrico</strong><small>Administrador Vexa</small></div></div>
          </div>
        </header>

        <div className="page-wrap">
          <section className="hero">
            <div>
              <div className="hero-badge"><Icon name="sparkles" size={14} /> Central de operações</div>
              <h1>Bom dia, Henrico.</h1>
              <p>Acompanhe a implantação e, depois, toda a operação comercial das lojas em um só lugar.</p>
            </div>
            <div className="hero-actions">
              <select aria-label="Selecionar loja" defaultValue="all">
                <option value="all">Todas as lojas</option>
                <option value="pilot">Loja piloto</option>
              </select>
              <button className="primary-button"><span>+</span> Nova loja</button>
            </div>
          </section>

          <section className="notice-card">
            <div className="notice-icon"><Icon name="shield" /></div>
            <div><strong>Base segura e multi-loja</strong><p>Cada operação será isolada por <code>store_id</code>. Integrações só serão marcadas como ativas depois de testes reais.</p></div>
            <button onClick={() => selectNavigation("Auditoria")}>Ver arquitetura <Icon name="arrow" size={16} /></button>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div><span className="section-kicker">SAÚDE DA OPERAÇÃO</span><h2>Integrações principais</h2></div>
              <button className="text-button" onClick={() => selectNavigation("Integrações")}>Gerenciar integrações <Icon name="arrow" size={15} /></button>
            </div>
            <div className="integration-grid">
              {integrations.map((integration) => (
                <article className="integration-card" key={integration.name}>
                  <div className={`integration-logo integration-${integration.name.toLowerCase()}`}>{integration.shortName}</div>
                  <div className="integration-copy"><div className="integration-title"><h3>{integration.name}</h3><StatusDot tone={integration.tone} /></div><p>{integration.description}</p><div className="status-label"><strong>{integration.status}</strong><span>{integration.detail}</span></div></div>
                </article>
              ))}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading metrics-heading">
              <div><span className="section-kicker">VISÃO DO DIA</span><h2>Desempenho comercial</h2></div>
              <div className="period-control">{["Hoje", "7 dias", "30 dias"].map((item) => <button key={item} className={period === item ? "selected" : ""} onClick={() => setPeriod(item)}>{item}</button>)}</div>
            </div>
            <div className="metric-grid">
              <article><div className="metric-icon blue"><Icon name="users" /></div><span>Novos leads</span><strong>{period === "Hoje" ? "48" : period === "7 dias" ? "284" : "1.126"}</strong><small className="positive">↗ 12,5% <em>vs. período anterior</em></small></article>
              <article><div className="metric-icon purple"><Icon name="bot" /></div><span>Atendidos pela IA</span><strong>{period === "Hoje" ? "39" : period === "7 dias" ? "237" : "948"}</strong><small className="positive">81,3% <em>dos novos leads</em></small></article>
              <article><div className="metric-icon orange"><Icon name="chat" /></div><span>Handoffs humanos</span><strong>{period === "Hoje" ? "9" : period === "7 dias" ? "47" : "178"}</strong><small>23,1% <em>dos atendimentos</em></small></article>
              <article><div className="metric-icon green"><Icon name="clock" /></div><span>Tempo de 1ª resposta</span><strong>8s</strong><small className="positive">↓ 3s <em>mais rápido</em></small></article>
            </div>
            <p className="demo-caption">Dados demonstrativos para validação do layout. Serão substituídos pelos dados reais após as integrações.</p>
          </section>

          <div className="content-grid">
            <section className="panel conversations-panel">
              <div className="panel-heading"><div><span className="section-kicker">TEMPO REAL</span><h2>Conversas recentes</h2></div><button onClick={() => selectNavigation("Conversas")}>Ver todas <Icon name="arrow" size={15} /></button></div>
              <div className="conversation-list">
                {visibleConversations.map((conversation) => (
                  <article className="conversation-row" key={conversation.id}>
                    <div className="customer-avatar">{conversation.initials}</div>
                    <div className="conversation-main"><div><strong>{conversation.customer}</strong><span>{conversation.id}</span></div><p>{conversation.lastMessage}</p><small>{conversation.channel}</small></div>
                    <div className="conversation-meta"><time>{conversation.time}</time><span className={`temperature temperature-${conversation.temperature.toLowerCase()}`}>{conversation.temperature}</span><small>{conversation.stage}</small></div>
                  </article>
                ))}
                {visibleConversations.length === 0 && <div className="empty-state">Nenhuma conversa encontrada para “{query}”.</div>}
              </div>
            </section>

            <section className="panel roadmap-panel">
              <div className="panel-heading"><div><span className="section-kicker">IMPLANTAÇÃO</span><h2>Próximas etapas</h2></div><span className="progress-label">1 de 4</span></div>
              <div className="progress-track"><span /></div>
              <div className="checklist">
                {checklist.map((item, index) => (
                  <div className={`checklist-item checklist-${item.state}`} key={item.label}>
                    <div className="checklist-marker">{item.state === "done" ? <Icon name="check" size={15} /> : index + 1}</div>
                    <div><strong>{item.label}</strong><p>{item.detail}</p></div>
                  </div>
                ))}
              </div>
              <button className="roadmap-action" onClick={() => selectNavigation("Integrações")}>Continuar implantação <Icon name="arrow" size={16} /></button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
