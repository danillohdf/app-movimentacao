import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/servidor";

const TIPOS: EmailOtpType[] = ["email", "magiclink", "invite", "signup", "recovery", "email_change"];

/** Destino do link do e-mail (alternativa ao código de 6 dígitos). */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const supabase = await criarClienteServidor();

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;

  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && tipo && TIPOS.includes(tipo)) {
    ok = !(await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash })).error;
  }

  // Destino fixo (nunca vindo da URL) para evitar redirecionamento para sites de fora.
  return NextResponse.redirect(`${origin}${ok ? "/inicio" : "/entrar?motivo=link-invalido"}`);
}
