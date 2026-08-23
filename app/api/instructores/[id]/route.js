import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { apiRoute } from "@/lib/apiRoute";

export const GET = apiRoute(async function GET(request, { params }) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from("instructores")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
});

export const PUT = apiRoute(async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { nombreApellido, observaciones } = body;

  if (!nombreApellido || !nombreApellido.trim()) {
    return NextResponse.json(
      { error: "El nombre y apellido es obligatorio" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("instructores")
    .update({
      nombre_apellido: nombreApellido.trim(),
      observaciones: observaciones || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
});

export const DELETE = apiRoute(async function DELETE(request, { params }) {
  const { id } = await params;
  const { error } = await supabaseAdmin.from("instructores").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
});
