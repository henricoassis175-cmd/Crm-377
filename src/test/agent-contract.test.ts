import { describe, expect, it } from "vitest";
import { FALLBACK_OUTPUT, parseAgentOutput } from "@/lib/agent-contract";

describe("Agent 377 output parser", () => {
  it("accepts a valid strict output", () => {
    const result = parseAgentOutput(JSON.stringify({
      resposta: "Posso te ajudar com isso.",
      temperatura_lead: "quente",
      estagio: "pre_fechamento",
      acao: "conversar",
      motivo_handoff: null,
    }));

    expect(result.valid).toBe(true);
    expect(result.usedFallback).toBe(false);
    expect(result.output.temperatura_lead).toBe("quente");
  });

  it("uses safe fallback for invalid JSON", () => {
    const result = parseAgentOutput("resposta fora do contrato");

    expect(result.valid).toBe(false);
    expect(result.usedFallback).toBe(true);
    expect(result.output).toEqual(FALLBACK_OUTPUT);
  });

  it("requires handoff reason when forwarding to a human", () => {
    const result = parseAgentOutput(JSON.stringify({
      resposta: "Vou chamar alguém do time.",
      temperatura_lead: "morna",
      estagio: "handoff",
      acao: "encaminhar_humano",
      motivo_handoff: null,
    }));

    expect(result.valid).toBe(false);
    expect(result.output).toEqual(FALLBACK_OUTPUT);
  });
});
