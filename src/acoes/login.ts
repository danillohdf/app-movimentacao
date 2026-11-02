"use server";

import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { esquemaCodigo, esquemaEmail } from "@/lib/validacao/esquemas";

export type EstadoLogin = { etapa: "email" | "codigo"; email?: string; erro?: string };

export async function enviarCodigo(_: EstadoLogin, fd: FormData): Promise<EstadoLogin> {
  const email = esquemaEmail.safeParse(fd.get("email"));
  if (!email.success) return { etapa: "email", erro: "Digite um e-mail válido." };

  const supabase = await criarClienteServidor();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: {
      shouldCreateUser: false, // só entra quem foi cadastrado pelo admin
      emailRedirectTo: site ? `${site}/auth/confirmar` : undefined,
    },
  });

  if (error?.status === 429) {
    return { etapa: "email", erro: "Muitas tentativas. Espere alguns minutos e tente de novo." };
  }
  // Para não revelar quem tem cadastro, a resposta é a mesma com ou sem conta.
  return { etapa: "codigo", email: email.data };
}

export async function verificarCodigo(_: EstadoLogin, fd: FormData): Promise<EstadoLogin> {
  const email = esquemaEmail.safeParse(fd.get("email"));
  const codigo = esquemaCodigo.safeParse(fd.get("codigo"));
  if (!email.success) return { etapa: "email", erro: "Digite seu e-mail de novo." };
  if (!codigo.success) {
    return { etapa: "codigo", email: email.data, erro: "O código tem 6 números." };
  }

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.verifyOtp({
    email: email.data,
    token: codigo.data,
    type: "email",
  });

  if (error) {
    const msg =
      error.status === 429
        ? "Muitas tentativas. Espere alguns minutos."
        : "Código errado ou vencido. Confira o e-mail mais recente ou peça um novo código.";
    return { etapa: "codigo", email: email.data, erro: msg };
  }

  redirect("/inicio");
}

export async function sair() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/entrar");
}
