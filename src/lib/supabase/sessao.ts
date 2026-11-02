import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./tipos";

const ROTAS_PUBLICAS = ["/entrar", "/auth"];

/**
 * Roda no proxy em toda requisição: renova a sessão do Supabase, aplica a CSP com nonce e manda
 * para /entrar quem não está logado.
 */
export async function atualizarSessao(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = montarCsp(nonce);

  const proximaResposta = () => {
    const headers = new Headers(request.headers);
    headers.set("x-nonce", nonce);
    headers.set("Content-Security-Policy", csp);
    const resposta = NextResponse.next({ request: { headers } });
    resposta.headers.set("Content-Security-Policy", csp);
    return resposta;
  };

  let resposta = proximaResposta();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, cacheHeaders) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          resposta = proximaResposta();
          cookiesToSet.forEach(({ name, value, options }) =>
            resposta.cookies.set(name, value, options),
          );
          Object.entries(cacheHeaders ?? {}).forEach(([chave, valor]) =>
            resposta.headers.set(chave, valor),
          );
        },
      },
    },
  );

  // Não colocar código entre createServerClient e getClaims (orientação do Supabase).
  const { data } = await supabase.auth.getClaims();
  const logado = Boolean(data?.claims?.sub);

  const caminho = request.nextUrl.pathname;
  const publica = ROTAS_PUBLICAS.some((r) => caminho === r || caminho.startsWith(`${r}/`));

  if (!logado && !publica) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = "";
    const redirecionamento = NextResponse.redirect(url);
    resposta.cookies.getAll().forEach((c) => redirecionamento.cookies.set(c));
    for (const h of ["cache-control", "expires", "pragma", "content-security-policy"]) {
      const valor = resposta.headers.get(h);
      if (valor) redirecionamento.headers.set(h, valor);
    }
    return redirecionamento;
  }

  return resposta;
}

function montarCsp(nonce: string) {
  const dev = process.env.NODE_ENV === "development";
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseWs = supabase.replace(/^https:/, "wss:");
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""};
    style-src 'self'${dev ? " 'unsafe-inline'" : ` 'nonce-${nonce}'`};
    img-src 'self' blob: data: ${supabase};
    font-src 'self';
    connect-src 'self' ${supabase} ${supabaseWs};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();
}
