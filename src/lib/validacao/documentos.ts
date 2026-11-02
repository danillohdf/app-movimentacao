// Regras puras de documentos brasileiros e máscaras. Sem dependências: testadas com Vitest.

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

export function cpfValido(valor: string): boolean {
  const cpf = somenteDigitos(valor);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digito = (base: string, pesoInicial: number) => {
    const soma = base
      .split("")
      .reduce((acc, n, i) => acc + Number(n) * (pesoInicial - i), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return (
    digito(cpf.slice(0, 9), 10) === Number(cpf[9]) &&
    digito(cpf.slice(0, 10), 11) === Number(cpf[10])
  );
}

export function cnpjValido(valor: string): boolean {
  const cnpj = somenteDigitos(valor);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  const digito = (base: string) => {
    const pesos =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = base.split("").reduce((acc, n, i) => acc + Number(n) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return (
    digito(cnpj.slice(0, 12)) === Number(cnpj[12]) &&
    digito(cnpj.slice(0, 13)) === Number(cnpj[13])
  );
}

/** Aceita (11) 98765-4321, 11987654321, +55 11 98765-4321... e devolve só DDD + número. */
export function normalizarTelefone(valor: string): string | null {
  let digitos = somenteDigitos(valor);
  if (digitos.length >= 12 && digitos.startsWith("55")) digitos = digitos.slice(2);
  return /^[1-9][0-9]{9,10}$/.test(digitos) ? digitos : null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type TipoPix = "cpf" | "cnpj" | "email" | "telefone" | "aleatoria";

/** Valida e normaliza a chave Pix conforme o tipo. Devolve null se inválida. */
export function normalizarChavePix(tipo: TipoPix, valor: string): string | null {
  const v = valor.trim();
  switch (tipo) {
    case "cpf":
      return cpfValido(v) ? somenteDigitos(v) : null;
    case "cnpj":
      return cnpjValido(v) ? somenteDigitos(v) : null;
    case "email":
      return EMAIL.test(v) && v.length <= 77 ? v.toLowerCase() : null;
    case "telefone": {
      const tel = normalizarTelefone(v);
      return tel ? `+55${tel}` : null;
    }
    case "aleatoria":
      return UUID.test(v) ? v.toLowerCase() : null;
  }
}

export function formatarCpf(cpf: string): string {
  const d = somenteDigitos(cpf);
  return d.length === 11 ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}` : cpf;
}

export function formatarCnpj(cnpj: string): string {
  const d = somenteDigitos(cnpj);
  return d.length === 14
    ? `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
    : cnpj;
}

export function formatarTelefone(tel: string | null | undefined): string {
  if (!tel) return "";
  const d = somenteDigitos(tel);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return tel;
}
