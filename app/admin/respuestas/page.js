"use client";

import { useEffect, useMemo, useState } from "react";
import { RATING_QUESTIONS } from "@/lib/questions";
import { fetchJson } from "@/lib/fetchJson";

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Respuestas</h1>
        <button
          onClick={handleExportCsv}
          disabled={respuestas.length === 0}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Exportar CSV
        </button>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Capacitación</label>
          <select
            value={capacitacionId}
            onChange={(e) => setCapacitacionId(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
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
          <label className="block text-sm font-medium text-slate-700">Instructor</label>
          <select
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
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
              className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm"
            >
              <p className="text-2xl font-bold text-sky-700">{promedios[q.column]}</p>
              <p className="mt-1 text-xs text-slate-500">{q.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && respuestas.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                  No hay respuestas todavía.
                </td>
              </tr>
            )}
            {respuestas.map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {new Date(r.creada_en).toLocaleString("es-AR")}
                </td>
                <td className="px-4 py-3 text-slate-800">{r.capacitaciones?.nombre}</td>
                <td className="px-4 py-3 text-slate-800">{r.instructores?.nombre_apellido}</td>
                {RATING_QUESTIONS.map((q) => (
                  <td key={q.column} className="px-4 py-3 text-center text-slate-700">
                    {r[q.column]}
                  </td>
                ))}
                <td className="max-w-xs px-4 py-3 text-slate-600">{r.observaciones || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
