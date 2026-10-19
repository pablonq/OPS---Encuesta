"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/fetchJson";
import PageHeader from "@/components/ui/PageHeader";

const emptyForm = {
  nombre: "",
  cargaHoraria: "",
  observacion: "",
  descripcion: "",
  procedimientos: "",
};

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
      descripcion: item.descripcion ?? "",
      procedimientos: item.procedimientos ?? "",
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
          descripcion: form.descripcion,
          procedimientos: form.procedimientos,
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
      <PageHeader eyebrow="Gestión" title="Capacitaciones" description="Catálogo de capacitaciones y los datos que se imprimen en cada credencial." />

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 rounded-ops-lg border border-ops-border bg-white p-5 shadow-ops-sm sm:grid-cols-2"
      >
        <div>
          <label className="block text-[13px] font-medium text-ops-navy">Nombre</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            className="mt-1 w-full rounded-ops-md border border-ops-border-2 p-2 text-sm focus:border-ops-blue focus:outline-none focus:ring-[3px] focus:ring-ops-blue/20"
            required
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-ops-navy">
            Carga horaria (hs)
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={form.cargaHoraria}
            onChange={(e) => setForm((f) => ({ ...f, cargaHoraria: e.target.value }))}
            className="mt-1 w-full rounded-ops-md border border-ops-border-2 p-2 text-sm focus:border-ops-blue focus:outline-none focus:ring-[3px] focus:ring-ops-blue/20"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[13px] font-medium text-ops-navy">Observación</label>
          <textarea
            rows={2}
            value={form.observacion}
            onChange={(e) => setForm((f) => ({ ...f, observacion: e.target.value }))}
            className="mt-1 w-full rounded-ops-md border border-ops-border-2 p-2 text-sm focus:border-ops-blue focus:outline-none focus:ring-[3px] focus:ring-ops-blue/20"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-[13px] font-medium text-ops-navy">
            Descripción <span className="font-normal text-ops-gray-400">(se muestra en la credencial)</span>
          </label>
          <textarea
            rows={2}
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            placeholder="Ej: Maniobras básicas con kit de rescate."
            className="mt-1 w-full rounded-ops-md border border-ops-border-2 p-2 text-sm focus:border-ops-blue focus:outline-none focus:ring-[3px] focus:ring-ops-blue/20"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[13px] font-medium text-ops-navy">
            Procedimientos <span className="font-normal text-ops-gray-400">(uno por línea; se muestran en la credencial)</span>
          </label>
          <textarea
            rows={3}
            value={form.procedimientos}
            onChange={(e) => setForm((f) => ({ ...f, procedimientos: e.target.value }))}
            placeholder={"OPS-PO-GEN Nº017 Espacio Confinado.\nOPS-PO-GEN Nº041 Plan de Rescate en espacio confinado."}
            className="mt-1 w-full rounded-ops-md border border-ops-border-2 p-2 text-sm focus:border-ops-blue focus:outline-none focus:ring-[3px] focus:ring-ops-blue/20"
          />
        </div>

        {error && <p className="text-sm text-ops-danger sm:col-span-2">{error}</p>}

        <div className="flex gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-ops-md bg-ops-blue px-4 py-2 text-sm font-semibold text-white hover:bg-ops-blue-600 hover:shadow-ops-blue disabled:opacity-60"
          >
            {editingId ? "Guardar cambios" : "Agregar capacitación"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-ops-md border border-ops-border-2 px-4 py-2 text-sm font-medium text-ops-gray-700 hover:bg-ops-blue-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-ops-lg border border-ops-border bg-white shadow-ops-sm">
        <table className="min-w-full divide-y divide-ops-border text-sm">
          <thead className="bg-ops-gray-50 text-left font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-ops-gray-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Carga horaria</th>
              <th className="px-4 py-3">Observación</th>
              <th className="px-4 py-3">Credencial</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ops-border">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ops-gray-400">
                  Cargando...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ops-gray-400">
                  No hay capacitaciones cargadas.
                </td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-ops-blue-50">
                <td className="px-4 py-3 font-medium text-ops-navy">{item.nombre}</td>
                <td className="px-4 py-3 text-ops-gray-600">{item.carga_horaria ?? "-"}</td>
                <td className="px-4 py-3 text-ops-gray-600">{item.observacion || "-"}</td>
                <td className="px-4 py-3 text-xs text-ops-gray-500">
                  {item.descripcion && item.procedimientos
                    ? "Completa"
                    : "Falta " +
                      [!item.descripcion && "descripción", !item.procedimientos && "procedimientos"]
                        .filter(Boolean)
                        .join(" y ")}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => startEdit(item)}
                    className="mr-3 text-ops-blue hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
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
