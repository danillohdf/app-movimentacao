import type { ReactNode } from "react";

type CampoProps = {
  rotulo: string;
  nome: string;
  valor?: string | null;
  tipo?: string;
  obrigatorio?: boolean;
  dica?: string;
  modo?: "text" | "email" | "tel" | "numeric";
  autoComplete?: string;
  max?: number;
};

export function Campo({ rotulo, nome, valor, tipo = "text", obrigatorio, dica, modo, autoComplete, max }: CampoProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">
        {rotulo}
        {obrigatorio && <span className="text-red-600"> *</span>}
      </span>
      <input
        name={nome}
        type={tipo}
        defaultValue={valor ?? ""}
        required={obrigatorio}
        inputMode={modo}
        autoComplete={autoComplete ?? "off"}
        maxLength={max}
        className="campo"
      />
      {dica && <span className="text-xs text-slate-500">{dica}</span>}
    </label>
  );
}

type OpcaoSelecao = { valor: string; texto: string };

export function Selecao({
  rotulo,
  nome,
  opcoes,
  valor,
  obrigatorio,
  vazio,
}: {
  rotulo: string;
  nome: string;
  opcoes: OpcaoSelecao[];
  valor?: string | null;
  obrigatorio?: boolean;
  vazio?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700">
        {rotulo}
        {obrigatorio && <span className="text-red-600"> *</span>}
      </span>
      <select name={nome} defaultValue={valor ?? ""} required={obrigatorio} className="campo">
        {vazio !== undefined && <option value="">{vazio}</option>}
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Interruptor({ rotulo, nome, marcado }: { rotulo: string; nome: string; marcado?: boolean }) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-xl bg-slate-50 px-4 ring-1 ring-slate-200">
      <input name={nome} type="checkbox" defaultChecked={marcado} className="size-5 accent-blue-700" />
      <span className="text-base text-slate-800">{rotulo}</span>
    </label>
  );
}

export function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-slate-500">{titulo}</legend>
      {children}
    </fieldset>
  );
}

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB",
  "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
].map((uf) => ({ valor: uf, texto: uf }));
