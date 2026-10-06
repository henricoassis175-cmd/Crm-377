import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { StoreProvider } from "@/hooks/use-store";
import { SectionBoundary } from "@/components/data-state";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel — CRM 377" },
      { name: "description", content: "Painel operacional do CRM 377." },
      { property: "og:title", content: "Painel — CRM 377" },
      { property: "og:description", content: "Painel operacional do CRM 377." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PainelLayout,
});

function PainelLayout() {
  return (
    <StoreProvider>
      <AppShell>
        <SectionBoundary>
          <Outlet />
        </SectionBoundary>
      </AppShell>
    </StoreProvider>
  );
}