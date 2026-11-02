"use client";

import { useActionState, useTransition, type ReactNode } from "react";
import type { Estado } from "@/lib/formulario";

type Props = {
  acao: (estado: Estado, fd: FormData) => Promise<Estado>;
  textoBotao: string;
  children: ReactNode;
  className?: string;
};

/**
 * Formulário padrão: mostra erro/sucesso e NÃO apaga o que foi digitado quando dá erro
 * (importante no celular, para ninguém ter que digitar tudo de novo).
 */
export function Formulario({ acao, textoBotao, children, className }: Props) {
  const [estado, executar, salvando] = useActionState(acao, {});
  const [, iniciar] = useTransition();

  return (
    <form
      className={className ?? "flex flex-col gap-4"}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        iniciar(() => executar(fd));
      }}
    >
      {children}
      {estado.erro && (
        <p role="alert" className="aviso-erro">
          {estado.erro}
        </p>
      )}
      {estado.mensagem && (
        <p role="status" className="aviso-ok">
          {estado.mensagem}
        </p>
      )}
      <button type="submit" disabled={salvando} className="botao-primario">
        {salvando ? "Salvando..." : textoBotao}
      </button>
    </form>
  );
}
