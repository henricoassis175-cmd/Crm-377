<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Port the official CRM 377 GitHub main product system through semantic CSS tokens and shared UI primitives, never through a static App.tsx replacement; this preserves real routing, auth, queries and integrations.
- Keep dashboard period selection in a shared accessible control and scope period queries by store and period; this keeps the animated chip tied to real data without changing lifetime lead and pending-handoff totals.