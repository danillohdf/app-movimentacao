import { notFound } from "next/navigation";
import { Cabecalho } from "@/componentes/pagina";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { FormularioGrupo } from "../formulario";

export const metadata = { title: "Editar GP" };

export default async function EditarGrupo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await criarClienteServidor();
  const { data: grupo } = await supabase.from("grupos").select("*").eq("id", id).maybeSingle();
  if (!grupo) notFound();
  return (
    <>
      <Cabecalho titulo={grupo.codigo} voltar="/admin/grupos" />
      <FormularioGrupo grupo={grupo} />
    </>
  );
}
