import { describe, expect, it } from "vitest";
import { hasMinRole } from "@/hooks/use-auth";

describe("RBAC role hierarchy", () => {
  it("denies access when no role is loaded", () => {
    expect(hasMinRole(null, "operador")).toBe(false);
  });

  it("keeps least privilege ordering", () => {
    expect(hasMinRole("operador", "gestor")).toBe(false);
    expect(hasMinRole("gestor", "operador")).toBe(true);
    expect(hasMinRole("gestor", "admin")).toBe(false);
    expect(hasMinRole("admin", "gestor")).toBe(true);
    expect(hasMinRole("admin", "admin")).toBe(true);
  });
});
