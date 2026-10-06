import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

// Gate de UI. A proteção real dos dados é feita por RLS no banco.
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Sem banco conectado o painel abre em modo vazio ("Banco ainda não conectado").
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});