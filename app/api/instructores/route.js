import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { apiRoute } from "@/lib/apiRoute";

export const GET = apiRoute(async function GET() {
  const { data, error } = await supabaseAdmin
    .from("instructores")
    .select("*")
    .order("nombre_apellido", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
});

export const POST = apiRoute(async function POST(request) {
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
    .insert({
      nombre_apellido: nombreApellido.trim(),
      observaciones: observaciones || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
});
