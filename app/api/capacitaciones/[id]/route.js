import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { apiRoute } from "@/lib/apiRoute";

export const GET = apiRoute(async function GET(request, { params }) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("capacitaciones")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
});

export const PUT = apiRoute(async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { nombre, cargaHoraria, observacion } = body;

  if (!nombre || !nombre.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("capacitaciones")
    .update({
      nombre: nombre.trim(),
      carga_horaria: cargaHoraria || null,
      observacion: observacion || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
});

export const DELETE = apiRoute(async function DELETE(request, { params }) {
  const { id } = await params;
  const { error } = await supabaseAdmin.from("capacitaciones").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
});
