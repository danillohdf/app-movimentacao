export type Estado = { erro?: string; mensagem?: string };

/** Transforma FormData em objeto simples (para validar com Zod). */
export function dadosDoFormulario(fd: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  fd.forEach((valor, chave) => {
    if (typeof valor === "string" && !chave.startsWith("$")) obj[chave] = valor;
  });
  return obj;
}

/** Traduz erros do banco para mensagens que o usuário entende, sem expor detalhes técnicos. */
export function erroDoBanco(erro: { code?: string; message?: string } | null): string {
  if (!erro) return "Não foi possível salvar. Tente de novo.";
  if (erro.code === "23505") return "Já existe um cadastro com esses dados (duplicado).";
  if (erro.code === "23503") return "Este cadastro está ligado a outro e não pode ser alterado assim.";
  if (erro.code === "42501" || erro.code === "P0001") return "Você não tem permissão para fazer isso.";
  if (erro.code === "23514") return "Algum campo está fora do formato esperado.";
  console.error("Erro do banco:", erro.code, erro.message);
  return "Não foi possível salvar. Tente de novo.";
}
