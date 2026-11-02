import { describe, expect, it } from "vitest";
import {
  cnpjValido,
  cpfValido,
  formatarCnpj,
  formatarCpf,
  normalizarChavePix,
  normalizarTelefone,
} from "./documentos";

describe("CPF", () => {
  it("aceita CPF válido com ou sem pontuação", () => {
    expect(cpfValido("529.982.247-25")).toBe(true);
    expect(cpfValido("52998224725")).toBe(true);
  });
  it("recusa dígito errado, tamanho errado e números repetidos", () => {
    expect(cpfValido("529.982.247-24")).toBe(false);
    expect(cpfValido("1234567890")).toBe(false);
    expect(cpfValido("111.111.111-11")).toBe(false);
  });
  it("formata", () => expect(formatarCpf("52998224725")).toBe("529.982.247-25"));
});

describe("CNPJ", () => {
  it("aceita CNPJ válido", () => {
    expect(cnpjValido("11.222.333/0001-81")).toBe(true);
    expect(cnpjValido("11222333000181")).toBe(true);
  });
  it("recusa CNPJ inválido", () => {
    expect(cnpjValido("11.222.333/0001-80")).toBe(false);
    expect(cnpjValido("00000000000000")).toBe(false);
    expect(cnpjValido("123")).toBe(false);
  });
  it("formata", () => expect(formatarCnpj("11222333000181")).toBe("11.222.333/0001-81"));
});

describe("Telefone", () => {
  it("normaliza formatos comuns", () => {
    expect(normalizarTelefone("(11) 98765-4321")).toBe("11987654321");
    expect(normalizarTelefone("+55 11 98765-4321")).toBe("11987654321");
    expect(normalizarTelefone("1133334444")).toBe("1133334444");
  });
  it("recusa número incompleto", () => {
    expect(normalizarTelefone("98765-4321")).toBeNull();
    expect(normalizarTelefone("")).toBeNull();
  });
});

describe("Chave Pix", () => {
  it("valida e normaliza cada tipo", () => {
    expect(normalizarChavePix("cpf", "529.982.247-25")).toBe("52998224725");
    expect(normalizarChavePix("cnpj", "11.222.333/0001-81")).toBe("11222333000181");
    expect(normalizarChavePix("email", " Fulano@Exemplo.com ")).toBe("fulano@exemplo.com");
    expect(normalizarChavePix("telefone", "(11) 98765-4321")).toBe("+5511987654321");
    expect(normalizarChavePix("aleatoria", "123E4567-E89B-12D3-A456-426614174000")).toBe(
      "123e4567-e89b-12d3-a456-426614174000",
    );
  });
  it("recusa chave que não bate com o tipo", () => {
    expect(normalizarChavePix("cpf", "123")).toBeNull();
    expect(normalizarChavePix("email", "sem-arroba")).toBeNull();
    expect(normalizarChavePix("telefone", "123")).toBeNull();
    expect(normalizarChavePix("aleatoria", "nao-e-uuid")).toBeNull();
  });
});
