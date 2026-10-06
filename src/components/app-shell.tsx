import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowRightLeft,
  Bell,
  BrainCircuit,
  Check,
  ChevronDown,
  FlaskConical,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  PackageSearch,
  PlugZap,
  Search,
  Settings,
  ShieldCheck,
  Store as StoreIcon,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth, useProfile, roleLabels } from "@/hooks/use-auth";
import { useStores } from "@/lib/store-context";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "TRABALHO",
    items: [
      { to: "/painel", label: "Visão geral", icon: LayoutDashboard, adminOnly: false },
      { to: "/painel/lojas", label: "Lojas", icon: StoreIcon, adminOnly: false },
      { to: "/painel/leads", label: "Leads e conversas", icon: Users, adminOnly: false },
      { to: "/painel/handoffs", label: "Handoffs", icon: ArrowRightLeft, adminOnly: false },
      {
        to: "/painel/catalogo",
        label: "Catálogo e estoque",
        icon: PackageSearch,
        adminOnly: false,
      },
    ],
  },
  {
    label: "SISTEMA",
    items: [
      { to: "/painel/cerebro", label: "Agente de IA Vexa", icon: BrainCircuit, adminOnly: true },
      { to: "/painel/laboratorio", label: "Laboratório", icon: FlaskConical, adminOnly: false },
      { to: "/painel/integracoes", label: "Integrações", icon: PlugZap, adminOnly: false },
      { to: "/painel/consumo-ia", label: "Consumo de IA", icon: Gauge, adminOnly: true },
      { to: "/painel/logs", label: "Logs e auditoria", icon: ShieldCheck, adminOnly: false },
      { to: "/painel/usuarios", label: "Usuários", icon: UserCog, adminOnly: true },
    ],
  },
] as const;

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, roles, isAdmin } = useProfile(user?.id);
  const { stores, store, storeId, setStoreId } = useStores();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const available = useMemo(
    () =>
      navGroups
        .flatMap<(typeof navGroups)[number]["items"][number]>((g) => [...g.items])
        .filter((i) => !i.adminOnly || isAdmin),
    [isAdmin],
  );
  const filtered = available.filter((i) =>
    i.label.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const initials = (profile?.full_name ?? user?.email ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setMobileOpen(false);
        setWorkspaceOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    if (searchOpen) window.setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery("");
  }, [searchOpen]);
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function sair() {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  }
  function go(to: (typeof available)[number]["to"]) {
    setSearchOpen(false);
    void navigate({ to });
  }

  const sidebar = (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[244px] flex-col border-r border-sidebar-border bg-sidebar px-2.5 py-3 transition-transform duration-200 ease-out lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="relative flex items-center gap-1">
        <Button
          variant="ghost"
          aria-expanded={workspaceOpen}
          onClick={() => setWorkspaceOpen((v) => !v)}
          className="grid min-h-10 min-w-0 flex-1 grid-cols-[30px_minmax(0,1fr)_16px] items-center gap-2 rounded-lg px-1.5 text-left whitespace-normal transition-colors hover:bg-accent"
        >
          <span className="grid size-[30px] place-items-center rounded-lg bg-primary text-[9px] font-bold text-primary-foreground">
            377
          </span>
          <span className="min-w-0 leading-tight">
            <strong className="block truncate text-[13px] font-semibold">
              {store?.store_name ?? "CRM 377"}
            </strong>
            <small className="block truncate text-[11px] text-muted-foreground">
              Workspace Vexa
            </small>
          </span>
          <ChevronDown
            className={cn(
              "size-3.5 text-muted-foreground transition-transform",
              workspaceOpen && "rotate-180",
            )}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
        >
          <X />
        </Button>
        {workspaceOpen ? (
          <div className="absolute left-0 top-12 z-50 w-[260px] rounded-lg border-0 bg-popover p-2 shadow-md">
            <p className="px-2 py-1.5 text-[11px] font-medium text-subtle">WORKSPACE ATUAL</p>
            {stores.map((s) => (
              <Button
                variant="ghost"
                key={s.id}
                onClick={() => {
                  setStoreId(s.id);
                  setWorkspaceOpen(false);
                }}
                className="grid w-full whitespace-normal h-auto grid-cols-[30px_1fr_16px] items-center gap-2 rounded-md p-2 text-left text-xs hover:bg-accent"
              >
                <span className="grid size-[30px] place-items-center rounded-md bg-primary text-[9px] font-bold text-primary-foreground">
                  377
                </span>
                <span className="truncate font-medium">{s.store_name}</span>
                {s.id === storeId ? <Check className="size-3.5 text-primary" /> : null}
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      <Button
        variant="ghost"
        onClick={() => setSearchOpen(true)}
        className="my-2.5 grid h-[34px] w-full whitespace-normal grid-cols-[18px_1fr_auto] items-center gap-2 rounded-lg border bg-surface/70 shadow-xs px-2 text-left text-[11px] text-muted-foreground transition-colors hover:border-input hover:bg-surface"
      >
        <Search className="size-3.5" />
        <span>Busca rápida</span>
        <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[9px]">⌘K</kbd>
      </Button>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto" aria-label="Navegação principal">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-0.5">
            <p className="px-2 pb-1 text-[11px] font-medium text-subtle">{group.label}</p>
            {group.items
              .filter((i) => !i.adminOnly || isAdmin)
              .map((item) => {
                const active =
                  item.to === "/painel" ? pathname === "/painel" : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "grid h-[34px] grid-cols-[19px_1fr] items-center gap-2 rounded-md px-2 text-xs font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
                      active &&
                        "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs [&>svg]:text-primary",
                    )}
                  >
                    <item.icon className="size-4" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-1 border-t border-sidebar-border pt-2">
        <Link
          to="/painel/documentacao"
          className="grid min-h-10 grid-cols-[28px_1fr] items-center gap-2 rounded-lg p-1.5 text-left whitespace-normal transition-colors hover:bg-accent/70"
        >
          <span className="grid size-7 place-items-center rounded-full border bg-surface">
            <HelpCircle className="size-3.5" />
          </span>
          <span>
            <strong className="block text-[11px] font-medium">Central de ajuda</strong>
            <small className="block text-[10px] text-muted-foreground">
              Documentação do sistema
            </small>
          </span>
        </Link>
        <div className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-sidebar-accent/70">
          <Avatar className="size-[30px] rounded-md">
            <AvatarFallback className="rounded-md bg-primary text-[9px] font-bold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-medium">{profile?.full_name ?? user?.email}</p>
            <p className="truncate text-[10px] text-muted-foreground">
              {roles[0] ? roleLabels[roles[0]] : "Sem papel"}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="size-7" onClick={sair} aria-label="Sair">
            <LogOut className="size-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background">
      {sidebar}
      {mobileOpen ? (
        <Button
          variant="ghost"
          className="fixed inset-0 z-40 h-auto rounded-none bg-foreground/30 backdrop-blur-[2px] hover:bg-foreground/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
        />
      ) : null}
      <div className="min-h-screen lg:ml-[244px]">
        <header className="sticky top-0 z-30 flex h-[50px] items-center justify-between border-b bg-background/90 px-3 backdrop-blur-md sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu />
            </Button>
            <span className="grid size-6 place-items-center rounded-md bg-muted">
              <LayoutDashboard className="size-3.5 text-muted-foreground" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold">{title}</p>
              {description ? (
                <p className="hidden truncate text-[10px] text-muted-foreground sm:block">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {actions}
            {stores.length ? (
              <select
                value={storeId ?? ""}
                onChange={(e) => setStoreId(e.target.value)}
                className="hidden h-[30px] max-w-48 rounded-md border bg-surface px-2 text-[10px] text-muted-foreground outline-none focus:ring-2 focus:ring-ring/15 sm:block"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.store_name}
                  </option>
                ))}
              </select>
            ) : null}
            <Link
              to="/painel/configuracoes"
              className="grid size-[30px] place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Configurações"
            >
              <Settings className="size-4" />
            </Link>
            <Button
              variant="ghost"
              className="relative grid size-[30px] p-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Notificações"
            >
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-[1450px] px-3 py-6 sm:px-5 lg:px-9 lg:py-[38px]">
          {children}
        </main>
      </div>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent
          aria-describedby={undefined}
          className="top-[14%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-[600px]"
        >
          <DialogTitle className="sr-only">Busca rápida</DialogTitle>
          <div className="flex h-14 items-center gap-2 border-b px-4">
            <Search className="size-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar ou acessar uma página..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              Esc
            </kbd>
          </div>
          <div className="max-h-[340px] overflow-y-auto p-2">
            <p className="px-2 py-1.5 text-[11px] font-medium text-subtle">NAVEGAÇÃO</p>
            {filtered.map((item) => (
              <Button
                variant="ghost"
                key={item.to}
                onClick={() => go(item.to)}
                className="grid min-h-[54px] h-auto w-full whitespace-normal grid-cols-[32px_1fr_16px] items-center gap-2 rounded-md px-2 text-left hover:bg-accent"
              >
                <span className="grid size-8 place-items-center rounded-md border bg-muted/50">
                  <item.icon className="size-4" />
                </span>
                <span className="text-xs font-medium">{item.label}</span>
                <MoreHorizontal className="size-3.5 text-muted-foreground" />
              </Button>
            ))}
            {!filtered.length ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                Nenhuma página encontrada.
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}