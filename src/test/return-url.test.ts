import { describe, expect, it } from "vitest";
import { isAllowedKommoUrl, isHttpsUrl } from "@/lib/return-url";

describe("return URL validation", () => {
  it("accepts HTTPS Kommo tenant URLs", () => {
    expect(isAllowedKommoUrl("https://minhaloja.kommo.com/api/v4/leads")).toBe(true);
    expect(isAllowedKommoUrl("https://minhaloja.amocrm.com/api/v4/leads")).toBe(true);
  });

  it("rejects arbitrary hosts and unsafe schemes", () => {
    expect(isAllowedKommoUrl("https://evil.example/kommo.com")).toBe(false);
    expect(isAllowedKommoUrl("http://minhaloja.kommo.com/api")).toBe(false);
    expect(isAllowedKommoUrl("https://user:pass@minhaloja.kommo.com/api")).toBe(false);
  });

  it("recognizes HTTPS generically", () => {
    expect(isHttpsUrl("https://example.com")).toBe(true);
    expect(isHttpsUrl("http://example.com")).toBe(false);
  });
});
