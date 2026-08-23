import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { apiRoute } from "@/lib/apiRoute";

export const GET = apiRoute(async function GET() {
  const { data, error } = await supabaseAdmin
    .from("capacitaciones")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
});

export const POST = apiRoute(async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { nombre, cargaHoraria, observacion } = body;

  if (!nombre || !nombre.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("capacitaciones")
    .insert({
      nombre: nombre.trim(),
      carga_horaria: cargaHoraria || null,
      observacion: observacion || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
});
