"use client";

import { useEffect, useMemo, useState } from "react";
import { RATING_QUESTIONS } from "@/lib/questions";
import { fetchJson } from "@/lib/fetchJson";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";

export default function RespuestasPage() {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [instructores, setInstructores] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [capacitacionId, setCapacitacionId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchJson("/api/capacitaciones"), fetchJson("/api/instructores")])
      .then(([caps, insts]) => {
        setCapacitaciones(caps);
        setInstructores(insts);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    // Refetch al cambiar los filtros; se muestra "Cargando..." mientras se resuelve.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const params = new URLSearchParams();
    if (capacitacionId) params.set("capacitacionId", capacitacionId);
    if (instructorId) params.set("instructorId", instructorId);
    fetchJson(`/api/respuestas?${params.toString()}`)
      .then(setRespuestas)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [capacitacionId, instructorId]);

  const promedios = useMemo(() => {
    if (respuestas.length === 0) return null;
    const sums = Object.fromEntries(RATING_QUESTIONS.map((q) => [q.column, 0]));
    for (const r of respuestas) {
      for (const q of RATING_QUESTIONS) sums[q.column] += r[q.column] || 0;
    }
    return Object.fromEntries(
      RATING_QUESTIONS.map((q) => [q.column, (sums[q.column] / respuestas.length).toFixed(2)])
    );
  }, [respuestas]);

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta respuesta? Esta acción no se puede deshacer.")) return;
    try {
      await fetchJson(`/api/respuestas/${id}`, { method: "DELETE" });
      setRespuestas((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function handleExportCsv() {
    const headers = [
      "Capacitación",
      "Instructor",
      ...RATING_QUESTIONS.map((q) => q.label),
      "Observaciones",
      "Fecha",
    ];
    const rows = respuestas.map((r) => [
      r.capacitaciones?.nombre || "",
      r.instructores?.nombre_apellido || "",
      ...RATING_QUESTIONS.map((q) => r[q.column]),
      (r.observaciones || "").replace(/\n/g, " "),
      new Date(r.creada_en).toLocaleString("es-AR"),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "respuestas-encuesta.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Seguimiento"
        title="Respuestas"
        description="Resultados de las encuestas completadas por los operadores."
        actions={
          <Button variant="secondary" onClick={handleExportCsv} disabled={respuestas.length === 0}>
            Exportar CSV
          </Button>
        }
      />

      {error && (
        <p className="rounded-ops-md border border-ops-danger/30 bg-ops-danger-bg p-3 text-sm text-[#b32d2d]">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 rounded-ops-lg border border-ops-border bg-white p-5 shadow-ops-sm sm:grid-cols-2">
        <div>
          <label className="block text-[13px] font-medium text-ops-navy">Capacitación</label>
          <select
            value={capacitacionId}
            onChange={(e) => setCapacitacionId(e.target.value)}
            className="mt-1 w-full rounded-ops-md border border-ops-border-2 p-2 text-sm focus:border-ops-blue focus:outline-none focus:ring-[3px] focus:ring-ops-blue/20"
          >
            <option value="">Todas</option>
            {capacitaciones.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-ops-navy">Instructor</label>
          <select
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="mt-1 w-full rounded-ops-md border border-ops-border-2 p-2 text-sm focus:border-ops-blue focus:outline-none focus:ring-[3px] focus:ring-ops-blue/20"
          >
            <option value="">Todos</option>
            {instructores.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre_apellido}
              </option>
            ))}
          </select>
        </div>
      </div>

      {promedios && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {RATING_QUESTIONS.map((q) => (
            <div
              key={q.column}
              className="rounded-ops-lg border border-ops-border bg-white p-4 text-center shadow-ops-sm"
            >
              <p className="text-2xl font-bold text-ops-blue">{promedios[q.column]}</p>
              <p className="mt-1 text-xs text-ops-gray-500">{q.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-ops-lg border border-ops-border bg-white shadow-ops-sm">
        <table className="min-w-full divide-y divide-ops-border text-sm">
          <thead className="bg-ops-gray-50 text-left font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-ops-gray-500">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Capacitación</th>
              <th className="px-4 py-3">Instructor</th>
              {RATING_QUESTIONS.map((q) => (
                <th key={q.column} className="px-4 py-3 text-center">
                  {q.field}
                </th>
              ))}
              <th className="px-4 py-3">Observaciones</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ops-border">
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-ops-gray-400">
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && respuestas.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-ops-gray-400">
                  No hay respuestas todavía.
                </td>
              </tr>
            )}
            {respuestas.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-ops-blue-50">
                <td className="whitespace-nowrap px-4 py-3 text-ops-gray-600">
                  {new Date(r.creada_en).toLocaleString("es-AR")}
                </td>
                <td className="px-4 py-3 text-ops-navy">{r.capacitaciones?.nombre}</td>
                <td className="px-4 py-3 text-ops-navy">{r.instructores?.nombre_apellido}</td>
                {RATING_QUESTIONS.map((q) => (
                  <td key={q.column} className="px-4 py-3 text-center text-ops-gray-700">
                    {r[q.column]}
                  </td>
                ))}
                <td className="max-w-xs px-4 py-3 text-ops-gray-600">{r.observaciones || "-"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-ops-danger hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
