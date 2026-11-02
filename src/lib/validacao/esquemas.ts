import { z } from "zod";
import {
  cnpjValido,
  cpfValido,
  normalizarChavePix,
  normalizarTelefone,
  somenteDigitos,
} from "./documentos";

// Campo vazio do formulário vira null.
const vazioParaNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : typeof v === "string" ? v.trim() : v;

const textoObrigatorio = (rotulo: string, max: number) =>
  z
    .string({ error: `${rotulo} é obrigatório` })
    .trim()
    .min(2, `${rotulo}: mínimo 2 letras`)
    .max(max, `${rotulo}: máximo ${max} caracteres`);

const textoOpcional = (max: number) =>
  z.preprocess(vazioParaNull, z.string().max(max).nullable()).default(null);

const telefoneOpcional = z.preprocess(
  vazioParaNull,
  z
    .string()
    .nullable()
    .transform((v, ctx) => {
      if (v === null) return null;
      const tel = normalizarTelefone(v);
      if (!tel) {
        ctx.addIssue({ code: "custom", message: "Telefone inválido (use DDD + número)" });
        return z.NEVER;
      }
      return tel;
    }),
).default(null);

const ufOpcional = z
  .preprocess(
    (v) => (typeof v === "string" ? (v.trim() === "" ? null : v.trim().toUpperCase()) : v),
    z.string().regex(/^[A-Z]{2}$/, "UF inválida (ex.: SP)").nullable(),
  )
  .default(null);

const idOpcional = z.preprocess(vazioParaNull, z.uuid().nullable()).default(null);
const ativo = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

export const papeis = ["admin", "coordenador", "montador"] as const;
export const situacoes = ["pendente", "ativo", "inativo"] as const;
export const tiposPix = ["cpf", "cnpj", "email", "telefone", "aleatoria"] as const;

export const esquemaGrupo = z.object({
  codigo: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^GP[0-9]+$/, "Código deve ser GP seguido de número (ex.: GP1)"),
  razao_social: textoObrigatorio("Razão social", 200),
  cnpj: z
    .string()
    .refine(cnpjValido, "CNPJ inválido")
    .transform(somenteDigitos),
  ativo,
});

export const esquemaParque = z.object({
  nome: textoObrigatorio("Nome do parque", 120),
  grupo_id: z.uuid("Escolha o GP"),
  coordenador_id: idOpcional,
  shopping_atual: textoOpcional(160),
  cidade: textoOpcional(120),
  uf: ufOpcional,
  ativo,
});

export const esquemaHotel = z.object({
  nome: textoObrigatorio("Nome do hotel", 160),
  endereco: textoOpcional(250),
  cidade: textoOpcional(120),
  uf: ufOpcional,
  telefone: telefoneOpcional,
});

const baseUsuario = {
  nome: textoObrigatorio("Nome", 120),
  telefone: telefoneOpcional,
  papel: z.enum(papeis, "Escolha o papel"),
  coordenador_id: idOpcional,
};

const montadorPrecisaCoordenador = <T extends { papel: string; coordenador_id: string | null }>(
  u: T,
) => u.papel !== "montador" || u.coordenador_id !== null;

export const esquemaConvite = z
  .object({ ...baseUsuario, email: z.string().trim().toLowerCase().pipe(z.email("E-mail inválido")) })
  .refine(montadorPrecisaCoordenador, {
    message: "Montador precisa de um coordenador",
    path: ["coordenador_id"],
  });

export const esquemaUsuarioAdmin = z
  .object({ ...baseUsuario, ativo })
  .refine(montadorPrecisaCoordenador, {
    message: "Montador precisa de um coordenador",
    path: ["coordenador_id"],
  });

export const esquemaPerfil = z.object({
  nome: textoObrigatorio("Nome", 120),
  telefone: telefoneOpcional,
});

const cpfOpcional = z.preprocess(
  vazioParaNull,
  z
    .string()
    .nullable()
    .refine((v) => v === null || cpfValido(v), "CPF inválido")
    .transform((v) => (v === null ? null : somenteDigitos(v))),
).default(null);

/** Ajudante + dados de pagamento (Pix é opcional no cadastro rápido, mas vem completo se informado). */
export const esquemaAjudante = z
  .object({
    nome: textoObrigatorio("Nome", 120),
    telefone: telefoneOpcional,
    cpf: cpfOpcional,
    tipo_chave_pix: z.preprocess(vazioParaNull, z.enum(tiposPix).nullable()).default(null),
    chave_pix: z.preprocess(vazioParaNull, z.string().max(140).nullable()).default(null),
  })
  .transform((dados, ctx) => {
    if ((dados.tipo_chave_pix === null) !== (dados.chave_pix === null)) {
      ctx.addIssue({ code: "custom", message: "Informe o tipo e a chave Pix juntos" });
      return z.NEVER;
    }
    if (dados.tipo_chave_pix && dados.chave_pix) {
      const chave = normalizarChavePix(dados.tipo_chave_pix, dados.chave_pix);
      if (!chave) {
        ctx.addIssue({ code: "custom", message: "Chave Pix não confere com o tipo escolhido" });
        return z.NEVER;
      }
      return { ...dados, chave_pix: chave };
    }
    return dados;
  });

export const esquemaAjudanteAdmin = z.object({
  coordenador_id: z.uuid("Escolha o coordenador"),
  situacao: z.enum(situacoes),
});

export const esquemaEmail = z.string().trim().toLowerCase().pipe(z.email("E-mail inválido"));
export const esquemaCodigo = z
  .string()
  .trim()
  .regex(/^[0-9]{6,10}$/, "O código tem só números (6 dígitos)");

/** Junta as mensagens de erro do Zod numa frase para mostrar na tela. */
export function mensagemDeErro(erro: z.ZodError): string {
  return [...new Set(erro.issues.map((i) => i.message))].join(" · ");
}
