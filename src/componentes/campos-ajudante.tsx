import { Campo, Secao, Selecao } from "./campos";

export const OPCOES_PIX = [
  { valor: "cpf", texto: "CPF" },
  { valor: "telefone", texto: "Telefone" },
  { valor: "email", texto: "E-mail" },
  { valor: "cnpj", texto: "CNPJ" },
  { valor: "aleatoria", texto: "Chave aleatória" },
];

export function CamposAjudante({
  ajudante,
  pix,
}: {
  ajudante?: { nome: string; telefone: string | null };
  pix?: { cpf: string | null; tipo_chave_pix: string; chave_pix: string } | null;
}) {
  return (
    <>
      <Campo rotulo="Nome completo" nome="nome" valor={ajudante?.nome} obrigatorio autoComplete="off" />
      <Campo rotulo="Telefone (WhatsApp)" nome="telefone" valor={ajudante?.telefone} tipo="tel" modo="tel" />
      <Secao titulo="Pagamento (Pix)">
        <Campo rotulo="CPF" nome="cpf" valor={pix?.cpf} modo="numeric" />
        <Selecao rotulo="Tipo da chave Pix" nome="tipo_chave_pix" valor={pix?.tipo_chave_pix} vazio="Sem Pix por enquanto" opcoes={OPCOES_PIX} />
        <Campo rotulo="Chave Pix" nome="chave_pix" valor={pix?.chave_pix} />
      </Secao>
    </>
  );
}
