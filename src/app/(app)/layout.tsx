import { MenuInferior } from "@/componentes/menu-inferior";
import { exigirUsuario } from "@/lib/auth";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario();
  return (
    <>
      <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-5 px-4 pb-28 pt-[max(1.25rem,env(safe-area-inset-top))]">
        {children}
      </main>
      <MenuInferior papel={usuario.papel} />
    </>
  );
}
