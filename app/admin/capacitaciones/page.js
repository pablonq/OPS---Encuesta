"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/fetchJson";

const emptyForm = { nombre: "", cargaHoraria: "", observacion: "" };

export default function CapacitacionesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      setItems(await fetchJson("/api/capacitaciones"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Carga inicial de la lista al montar; load() también se reutiliza tras crear/editar/borrar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      nombre: item.nombre,
      cargaHoraria: item.carga_horaria ?? "",
      observacion: item.observacion ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/capacitaciones/${editingId}` : "/api/capacitaciones";
      const method = editingId ? "PUT" : "POST";
      await fetchJson(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          cargaHoraria: form.cargaHoraria ? Number(form.cargaHoraria) : null,
          observacion: form.observacion,
        }),
      });
      cancelEdit();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta capacitación? Se eliminarán también sus respuestas.")) return;
    await fetchJson(`/api/capacitaciones/${id}`, { method: "DELETE" }).catch((err) =>
      setError(err.message)
    );
    if (editingId === id) cancelEdit();
    await load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Capacitaciones</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Carga horaria (hs)
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={form.cargaHoraria}
            onChange={(e) => setForm((f) => ({ ...f, cargaHoraria: e.target.value }))}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700">Observación</label>
          <textarea
            rows={2}
            value={form.observacion}
            onChange={(e) => setForm((f) => ({ ...f, observacion: e.target.value }))}
            className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-1 focus:ring-sky-600"
          />
        </div>

        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

        <div className="flex gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
          >
            {editingId ? "Guardar cambios" : "Agregar capacitación"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Carga horaria</th>
              <th className="px-4 py-3">Observación</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No hay capacitaciones cargadas.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium text-slate-800">{item.nombre}</td>
                <td className="px-4 py-3 text-slate-600">{item.carga_horaria ?? "-"}</td>
                <td className="px-4 py-3 text-slate-600">{item.observacion || "-"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => startEdit(item)}
                    className="mr-3 text-sky-700 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:underline"
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
