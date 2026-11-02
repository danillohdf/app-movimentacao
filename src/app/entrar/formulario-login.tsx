"use client";

import { useActionState } from "react";
import { enviarCodigo, verificarCodigo, type EstadoLogin } from "@/acoes/login";

export function FormularioLogin() {
  const [estadoEmail, acaoEmail, enviandoEmail] = useActionState(enviarCodigo, {
    etapa: "email",
  } as EstadoLogin);
  const [estadoCodigo, acaoCodigo, verificando] = useActionState(verificarCodigo, {
    etapa: "codigo",
  } as EstadoLogin);

  const naEtapaCodigo = estadoEmail.etapa === "codigo" && estadoCodigo.etapa !== "email";
  const email = estadoEmail.email ?? "";

  if (!naEtapaCodigo) {
    return (
      <form action={acaoEmail} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Seu e-mail</span>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            defaultValue={estadoEmail.email}
            className="campo"
            placeholder="nome@empresa.com.br"
          />
        </label>
        {(estadoEmail.erro || estadoCodigo.erro) && (
          <p role="alert" className="aviso-erro">
            {estadoEmail.erro ?? estadoCodigo.erro}
          </p>
        )}
        <button type="submit" disabled={enviandoEmail} className="botao-primario">
          {enviandoEmail ? "Enviando..." : "Receber código por e-mail"}
        </button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-600">
        Se <strong>{email}</strong> tiver acesso, chegou um e-mail com um código de 6 números.
        Confira também a caixa de spam.
      </p>
      <form action={acaoCodigo} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={email} />
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Código</span>
          <input
            name="codigo"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={10}
            required
            autoFocus
            className="campo text-center text-2xl tracking-[0.5em]"
            placeholder="000000"
          />
        </label>
        {estadoCodigo.erro && (
          <p role="alert" className="aviso-erro">
            {estadoCodigo.erro}
          </p>
        )}
        <button type="submit" disabled={verificando} className="botao-primario">
          {verificando ? "Conferindo..." : "Entrar"}
        </button>
      </form>
      <form action={acaoEmail}>
        <input type="hidden" name="email" value={email} />
        <button type="submit" disabled={enviandoEmail} className="botao-secundario w-full">
          {enviandoEmail ? "Enviando..." : "Mandar outro código"}
        </button>
      </form>
    </div>
  );
}
