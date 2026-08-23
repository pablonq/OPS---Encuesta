import { notFound } from "next/navigation";
import Image from "next/image";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import EncuestaForm from "@/components/EncuestaForm";

export const dynamic = "force-dynamic";

async function getInstructorYCapacitaciones(instructorId) {
  const [{ data: instructor }, { data: capacitaciones }] = await Promise.all([
    supabaseAdmin.from("instructores").select("*").eq("id", instructorId).single(),
    supabaseAdmin.from("capacitaciones").select("id, nombre").order("nombre", { ascending: true }),
  ]);

  return { instructor, capacitaciones: capacitaciones || [] };
}

export default async function EncuestaPage({ params }) {
  const { instructorId } = await params;
  const { instructor, capacitaciones } = await getInstructorYCapacitaciones(instructorId);

  if (!instructor) {
    notFound();
  }

  return (
    <main className="min-h-full bg-[#008EC6] px-4 py-10">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-6">
        <Image src="/logo-ops.svg" alt="OPS - Oilfield Production Services" width={220} height={87} priority />

        <div className="w-full rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <header className="mb-8 space-y-1 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#008EC6]">
              Encuesta de capacitación
            </p>
            <h1 className="text-2xl font-bold text-slate-900">{instructor.nombre_apellido}</h1>
            <p className="text-sm text-slate-500">Elegí la capacitación que estás calificando.</p>
          </header>

          <EncuestaForm instructorId={instructor.id} capacitaciones={capacitaciones} />
        </div>
      </div>
    </main>
  );
}
