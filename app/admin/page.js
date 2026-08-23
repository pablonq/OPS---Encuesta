"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJson } from "@/lib/fetchJson";

export default function AdminDashboard() {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [instructores, setInstructores] = useState([]);
  const [respuestasCount, setRespuestasCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [capRes, instRes, respRes] = await Promise.all([
          fetchJson("/api/capacitaciones"),
          fetchJson("/api/instructores"),
          fetchJson("/api/respuestas"),
        ]);
        setCapacitaciones(capRes);
        setInstructores(instRes);
        setRespuestasCount(respRes.length);
      } catch (err) {
        setError(err.message || "No se pudo conectar con la base de datos.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Capacitaciones" value={capacitaciones.length} loading={loading} />
        <StatCard label="Instructores" value={instructores.length} loading={loading} />
        <StatCard label="Respuestas recibidas" value={respuestasCount} loading={loading} />
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">QR de encuesta</h2>
        <p className="mt-1 text-sm text-slate-500">
          Cada instructor tiene un QR fijo que lleva impreso a todas sus capacitaciones. Al
          escanearlo, el operador elige qué capacitación está calificando.
        </p>
        <Link
          href="/admin/instructores"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
        >
          Ver e imprimir QR de instructores
        </Link>
      </section>
    </div>
  );
}

function StatCard({ label, value, loading }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{loading ? "—" : value}</p>
    </div>
  );
}
