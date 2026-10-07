import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  ChevronsUpDown,
  CircleHelp,
  LogOut,
  Menu,
  Search,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasMinRole, useAuth } from "@/hooks/use-auth";
import { useStore } from "@/hooks/use-store";
import { NAV, type NavItem } from "@/lib/nav";
import { ROLE_LABEL } from "@/lib/format";
import { logAudit } from "@/lib/audit";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="grid size-6 place-items-center rounded-[6px] bg-[#232226] text-[9px] font-semibold tracking-[-0.03em] text-white shadow-raised">
        377
      </span>
      <span className="text-[12.5px] font-medium tracking-[-0.02em] text-foreground">CRM 377</span>
    </span>
  );
}

function useVisibleNav(): NavItem[] {
  const { configured, role } = useAuth();
  if (!configured) return NAV;
  return NAV.filter((n) => hasMinRole(role, n.minRole));
}

function StoreSwitcher() {
  const { stores, currentStore, setStoreId } = useStore();
  const qc = useQueryClient();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group flex w-full items-center gap-2 rounded-[8px] bg-white/72 px-2 py-1.5 text-left shadow-raised transition-[background-color,box-shadow] duration-150 hover:bg-white hover:shadow-ring-xs">
          <span className="grid size-6 shrink-0 place-items-center rounded-[6px] bg-primary/10 text-[10.5px] font-semibold text-primary">
            {currentStore?.store_name.slice(0, 1).toUpperCase() ?? "—"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[11.5px] font-medium">
              {currentStore?.store_name ?? "Nenhuma loja"}
            </span>
            <span className="block truncate text-[9.5px] text-muted-foreground">Workspace Vexa</span>
          </span>
          <ChevronsUpDown className="size-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[212px]">
        <DropdownMenuLabel>Lojas com acesso</DropdownMenuLabel>
        {stores.length === 0 && (
          <div className="px-2 py-2 text-[11px] text-muted-foreground">Nenhuma loja disponível</div>
        )}
        {stores.map((s) => (
          <DropdownMenuItem
            key={s.id}
            onSelect={() => {
              setStoreId(s.id);
              void qc.invalidateQueries();
            }}
            className={cn(s.id === currentStore?.id && "font-medium")}
          >
            {s.store_name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarContent({
  onNavigate,
  onSearch,
}: {
  onNavigate?: () => void;
  onSearch: () => void;
}) {
  const items = useVisibleNav();
  const { user, role, signOut, configured } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const group = (g: NavItem["group"], label?: string) => {
    const list = items.filter((i) => i.group === g);
    if (!list.length) return null;

    return (
      <div className="space-y-0.5">
        {label && (
          <p className="px-2 pb-1 pt-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/85">
            {label}
          </p>
        )}
        {list.map((i) => {
          const active =
            i.to === "/painel"
              ? pathname === "/painel" || pathname === "/painel/"
              : pathname.startsWith(i.to);

          return (
            <Link
              key={i.to}
              to={i.to}
              onClick={onNavigate}
              className={cn(
                "group flex h-[30px] items-center gap-2 rounded-[7px] px-2 text-[11.5px] text-sidebar-foreground/88",
                "transition-[background-color,color,box-shadow,transform] duration-150 ease-out hover:bg-white/62",
                active && "bg-white font-medium text-sidebar-accent-foreground shadow-raised",
              )}
            >
              <i.icon
                className={cn(
                  "size-3.5 shrink-0 text-muted-foreground transition-colors",
                  active && "text-primary",
                )}
              />
              <span className="truncate">{i.label}</span>
            </Link>
          );
        })}
      </div>
    );
  };

  async function handleSignOut() {
    await logAudit({ action: "logout", entity: "auth" });
    await qc.cancelQueries();
    qc.clear();
    await signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 px-3 pb-2 pt-3">
        <Link to="/painel" onClick={onNavigate} className="flex h-7 items-center px-1">
          <Logo />
        </Link>
        <StoreSwitcher />
        <button
          onClick={onSearch}
          className="flex h-[30px] w-full items-center gap-2 rounded-[7px] bg-white/55 px-2 text-[10.5px] text-muted-foreground shadow-raised transition-[background-color,color] duration-150 hover:bg-white hover:text-foreground"
        >
          <Search className="size-3" />
          <span className="flex-1 text-left">Busca rápida</span>
          <kbd className="rounded-[4px] bg-[#f0efeb] px-1.5 py-0.5 font-mono text-[8.5px] text-muted-foreground shadow-raised">
            ⌘K
          </kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        {group("trabalho", "Trabalho")}
        {group("sistema", "Sistema")}
      </nav>

      <div className="px-3 pb-3">
        <div className="mb-2 border-t border-sidebar-border/70 pt-2">{group("outros")}</div>
        <div className="flex items-center gap-2 rounded-[8px] bg-white/40 px-2 py-2">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#deddd8] text-[9px] font-semibold">
            {(user?.email ?? "?").slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10.5px] font-medium">
              {user?.email ?? (configured ? "Sessão" : "Modo sem banco")}
            </p>
            <p className="truncate text-[9px] text-muted-foreground">
              {role ? ROLE_LABEL[role] : "Sem papel atribuído"}
            </p>
          </div>
          {configured && (
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              onClick={() => void handleSignOut()}
              aria-label="Sair"
            >
              <LogOut className="size-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CommandPalette({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const items = useVisibleNav();
  const navigate = useNavigate();

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar página ou ação…" />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>
        <CommandGroup heading="Navegação">
          {items.map((i) => (
            <CommandItem
              key={i.to}
              value={`${i.label} ${i.description}`}
              onSelect={() => {
                setOpen(false);
                void navigate({ to: i.to });
              }}
            >
              <i.icon className="size-3.5" />
              <span>{i.label}</span>
              <span className="ml-auto truncate text-[10px] text-muted-foreground">
                {i.description}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { currentStore } = useStore();
  const { configured } = useAuth();

  const current =
    [...NAV]
      .sort((a, b) => b.to.length - a.to.length)
      .find((n) => pathname === n.to || pathname.startsWith(`${n.to}/`)) ?? NAV[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-[#ecebe7]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] bg-[#efeee9] lg:block">
        <SidebarContent onSearch={() => setCmdOpen(true)} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[252px] border-0 bg-[#efeee9] p-0 shadow-ring-lg">
          <SheetTitle className="sr-only">Navegação</SheetTitle>
          <SidebarContent
            onNavigate={() => setMobileOpen(false)}
            onSearch={() => {
              setMobileOpen(false);
              setCmdOpen(true);
            }}
          />
        </SheetContent>
      </Sheet>

      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} />

      <div className="lg:ml-[232px] lg:p-2">
        <div className="min-h-screen overflow-hidden bg-[#fbfbf9] lg:min-h-[calc(100vh-16px)] lg:rounded-[14px] lg:shadow-ring-xs">
          <header className="sticky top-0 z-20 flex h-11 items-center gap-2.5 border-b border-border/70 bg-[#fbfbf9]/94 px-3 backdrop-blur-xl md:px-4">
            <Button
              size="icon"
              variant="ghost"
              className="size-7 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="size-3.5" />
            </Button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground">
                <span>CRM 377</span>
                <span className="text-border">/</span>
                <span className="truncate text-foreground/80">{current?.label}</span>
              </div>
            </div>

            {currentStore && (
              <span className="hidden items-center gap-1.5 rounded-[6px] bg-white px-2 py-1 text-[10px] shadow-raised md:inline-flex">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    currentStore.agent_paused ? "bg-warning" : "bg-success",
                  )}
                />
                {currentStore.store_name}
              </span>
            )}

            {!configured && (
              <span className="hidden rounded-[5px] bg-[#efeee9] px-2 py-1 text-[9.5px] text-muted-foreground sm:inline">
                Banco não conectado
              </span>
            )}

            <Button size="icon" variant="ghost" className="size-7" aria-label="Ajuda">
              <CircleHelp className="size-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="size-7" aria-label="Notificações">
              <Bell className="size-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="size-7" asChild aria-label="Configurações">
              <Link to="/painel/configuracoes">
                <Settings className="size-3.5" />
              </Link>
            </Button>
          </header>

          <main className="min-h-[calc(100vh-44px)]">{children}</main>
        </div>
      </div>
    </div>
  );
}
