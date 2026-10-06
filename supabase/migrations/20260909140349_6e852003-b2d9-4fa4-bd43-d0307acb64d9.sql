REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_access_store(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_write_store(uuid) FROM anon;