import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { apiRoute } from "@/lib/apiRoute";

export const DELETE = apiRoute(async function DELETE(request, { params }) {
  const { id } = await params;
  const { error } = await supabaseAdmin.from("respuestas").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
});
