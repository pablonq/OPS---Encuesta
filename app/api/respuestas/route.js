import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { RATING_QUESTIONS } from "@/lib/questions";
import { apiRoute } from "@/lib/apiRoute";

export const POST = apiRoute(async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { capacitacionId, instructorId, observaciones } = body;

  if (!capacitacionId || !instructorId) {
    return NextResponse.json(
      { error: "Falta la capacitación o el instructor" },
      { status: 400 }
    );
  }

  const ratings = {};
  for (const { field, column } of RATING_QUESTIONS) {
    const value = body[field];
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return NextResponse.json(
        { error: `Falta responder la pregunta: ${field}` },
        { status: 400 }
      );
    }
    ratings[column] = value;
  }

  const { data, error } = await supabaseAdmin
    .from("respuestas")
    .insert({
      capacitacion_id: capacitacionId,
      instructor_id: instructorId,
      ...ratings,
      observaciones: observaciones?.trim() || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
});

export const GET = apiRoute(async function GET(request) {
  const { searchParams } = new URL(request.url);
  const capacitacionId = searchParams.get("capacitacionId");
  const instructorId = searchParams.get("instructorId");

  let query = supabaseAdmin
    .from("respuestas")
    .select("*, capacitaciones(nombre), instructores(nombre_apellido)")
    .order("creada_en", { ascending: false });

  if (capacitacionId) query = query.eq("capacitacion_id", capacitacionId);
  if (instructorId) query = query.eq("instructor_id", instructorId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
});
