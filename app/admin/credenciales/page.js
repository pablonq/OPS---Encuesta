"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/lib/fetchJson";
import { parseCredencialesRows, sumarAnios } from "@/lib/credenciales";
import PageHeader from "@/components/ui/PageHeader";

const inputClass =
  "mt-1 w-full rounded-ops-md border border-ops-border-2 p-2 text-sm focus:border-ops-blue focus:outline-none focus:ring-[3px] focus:ring-ops-blue/20";

async function cargarBytes(url, { opcional = false } = {}) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    if (opcional) return null;
    throw new Error(`No se pudo cargar ${url}`);
  }
  return new Uint8Array(await respuesta.arrayBuffer());
}

export default function CredencialesPage() {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [instructores, setInstructores] = useState([]);
  const [error, setError] = useState("");

  const [archivo, setArchivo] = useState("");
  const [lectura, setLectura] = useState(null); // { credenciales, errores, advertencias }

  const [capacitacionId, setCapacitacionId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [fechaCapacitacion, setFechaCapacitacion] = useState("");
  const [vencimientoManual, setVencimientoManual] = useState(null);
  const [incluirFoto, setIncluirFoto] = useState(true);

  const [generando, setGenerando] = useState(false);
  const [resultado, setResultado] = useState(null); // { url, cantidad }

  useEffect(() => {
    Promise.all([fetchJson("/api/capacitaciones"), fetchJson("/api/instructores")])
      .then(([caps, insts]) => {
        setCapacitaciones(caps);
        setInstructores(insts);
      })
      .catch((err) => setError(err.message));
  }, []);

  // Libera el PDF anterior de memoria cuando se genera otro o se sale de la pantalla.
  useEffect(() => {
    return () => {
      if (resultado?.url) URL.revokeObjectURL(resultado.url);
    };
  }, [resultado]);

  const capacitacion = capacitaciones.find((c) => c.id === capacitacionId);
  const instructor = instructores.find((i) => i.id === instructorId);
  const fechaVencimiento = vencimientoManual ?? sumarAnios(fechaCapacitacion, 1);
  const cantidad = lectura?.credenciales.length ?? 0;
  const listo = cantidad > 0 && capacitacion && instructor && fechaCapacitacion && fechaVencimiento;

  async function handleArchivo(event) {
    const file = event.target.files?.[0];
    setError("");
    setResultado(null);
    setLectura(null);
    setArchivo("");
    if (!file) return;

    try {
      const { readSheet } = await import("read-excel-file/universal");
      const filas = await readSheet(file);
      setArchivo(file.name);
      setLectura(parseCredencialesRows(filas));
    } catch {
      setError("No se pudo leer el archivo. Verificá que sea un Excel (.xlsx) y que no esté protegido.");
    }
  }

  async function handleGenerar() {
    setError("");
    setResultado(null);
    setGenerando(true);
    try {
      const [{ generarCredencialesPdf }, regular, bold, black, logo, marcaAgua] = await Promise.all([
        import("@/lib/credencialPdf"),
        cargarBytes("/fonts/Roboto-Regular.ttf"),
        cargarBytes("/fonts/Roboto-Bold.ttf"),
        cargarBytes("/fonts/Roboto-Black.ttf"),
        // Logo (public/logo_ops2.png); si faltara, se dibuja un logo vectorial de respaldo.
        cargarBytes("/logo_ops2.png", { opcional: true }),
        // Figura de fondo "Reglas de vida" (public/Reglas_vida.png); si faltara, se omite.
        cargarBytes("/Reglas_vida.png", { opcional: true }),
      ]);

      const bytes = await generarCredencialesPdf({
        credenciales: lectura.credenciales,
        capacitacion,
        instructor,
        fechaCapacitacion,
        fechaVencimiento,
        incluirFoto,
        assets: { fonts: { regular, bold, black }, logo, marcaAgua },
      });

      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      setResultado({ url, cantidad: lectura.credenciales.length });
    } catch (err) {
      setError(`No se pudo generar el PDF: ${err.message}`);
    } finally {
      setGenerando(false);
    }
  }

  const avisos = [];
  if (instructor && !instructor.firma) {
    avisos.push("El instructor seleccionado no tiene firma cargada: las credenciales saldrán sin firma.");
  }
  if (capacitacion) {
    if (!capacitacion.carga_horaria) avisos.push("La capacitación no tiene carga horaria.");
    if (!capacitacion.descripcion) avisos.push("La capacitación no tiene descripción.");
    if (!capacitacion.procedimientos) avisos.push("La capacitación no tiene procedimientos.");
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Documentos" title="Credenciales" description="Generá todas las credenciales en un único PDF a partir de un Excel." />

      {error && (
        <p className="rounded-ops-md border border-ops-danger/30 bg-ops-danger-bg p-3 text-sm text-[#b32d2d]">{error}</p>
      )}

      {/* Paso 1: datos */}
      <section className="space-y-4 rounded-ops-lg border border-ops-border bg-white p-5 shadow-ops-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ops-navy">1. Cargar el listado de personas</h2>
            <p className="mt-1 text-sm text-ops-gray-500">
              Excel con las columnas <strong>Apellido, Nombres, DNI y Tarea</strong>. Los datos se
              procesan en tu navegador y no se guardan.
            </p>
          </div>
          <a
            href="/modelo-credenciales.xlsx"
            download
            className="rounded-ops-md border border-ops-border-2 px-4 py-2 text-sm font-medium text-ops-gray-700 hover:bg-ops-blue-50"
          >
            Descargar modelo de Excel
          </a>
        </div>

        <input
          type="file"
          accept=".xlsx"
          onChange={handleArchivo}
          className="text-sm text-ops-gray-600 file:mr-3 file:rounded-ops-md file:border-0 file:bg-ops-blue file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-ops-blue-600"
        />

        {lectura && (
          <div className="space-y-3">
            <p className="text-sm text-ops-gray-700">
              <strong>{archivo}</strong>: {cantidad} {cantidad === 1 ? "persona lista" : "personas listas"} para
              generar credencial.
            </p>

            {lectura.errores.length > 0 && (
              <ul className="list-inside list-disc rounded-ops-md border border-ops-danger/30 bg-ops-danger-bg p-3 text-sm text-[#b32d2d]">
                {lectura.errores.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
            {lectura.advertencias.length > 0 && (
              <ul className="list-inside list-disc rounded-ops-md border border-ops-warning/30 bg-ops-warning-bg p-3 text-sm text-[#a9690a]">
                {lectura.advertencias.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            )}
            {lectura.errores.length > 0 && cantidad > 0 && (
              <p className="text-xs text-ops-gray-500">Las filas con errores no se incluyen en el PDF.</p>
            )}

            {cantidad > 0 && (
              <div className="overflow-x-auto rounded-ops-md border border-ops-border">
                <table className="min-w-full divide-y divide-ops-border text-sm">
                  <thead className="bg-ops-gray-50 text-left font-display text-[11px] font-semibold uppercase tracking-[0.06em] text-ops-gray-500">
                    <tr>
                      <th className="px-3 py-2">Apellido</th>
                      <th className="px-3 py-2">Nombres</th>
                      <th className="px-3 py-2">DNI</th>
                      <th className="px-3 py-2">Tarea</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ops-border">
                    {lectura.credenciales.slice(0, 8).map((p, i) => (
                      <tr key={`${p.dni}-${i}`}>
                        <td className="px-3 py-2">{p.apellido}</td>
                        <td className="px-3 py-2">{p.nombres}</td>
                        <td className="px-3 py-2">{p.dni}</td>
                        <td className="px-3 py-2">{p.tarea}</td>
                      </tr>
                    ))}
                    {cantidad > 8 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-center text-xs text-ops-gray-400">
                          … y {cantidad - 8} más
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Paso 2: capacitación, instructor, fechas */}
      <section className="space-y-4 rounded-ops-lg border border-ops-border bg-white p-5 shadow-ops-sm">
        <h2 className="text-base font-semibold text-ops-navy">2. Capacitación e instructor</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[13px] font-medium text-ops-navy">Capacitación</label>
            <select
              value={capacitacionId}
              onChange={(e) => setCapacitacionId(e.target.value)}
              className={inputClass}
            >
              <option value="">Seleccionar...</option>
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
              className={inputClass}
            >
              <option value="">Seleccionar...</option>
              {instructores.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombre_apellido}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ops-navy">Fecha de capacitación</label>
            <input
              type="date"
              value={fechaCapacitacion}
              onChange={(e) => {
                setFechaCapacitacion(e.target.value);
                setVencimientoManual(null);
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ops-navy">
              Fecha de vencimiento <span className="font-normal text-ops-gray-400">(por defecto, 1 año)</span>
            </label>
            <input
              type="date"
              value={fechaVencimiento}
              onChange={(e) => setVencimientoManual(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-ops-gray-700">
          <input
            type="checkbox"
            checked={incluirFoto}
            onChange={(e) => setIncluirFoto(e.target.checked)}
            className="h-4 w-4 rounded border-ops-border-2"
          />
          Incluir recuadro vacío para pegar la foto
        </label>

        {avisos.length > 0 && (
          <ul className="list-inside list-disc rounded-ops-md border border-ops-warning/30 bg-ops-warning-bg p-3 text-sm text-[#a9690a]">
            {avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        )}
      </section>

      {/* Paso 3: generar */}
      <section className="space-y-4 rounded-ops-lg border border-ops-border bg-white p-5 shadow-ops-sm">
        <h2 className="text-base font-semibold text-ops-navy">3. Generar credenciales</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerar}
            disabled={!listo || generando}
            className="rounded-ops-md bg-ops-blue px-4 py-2 text-sm font-semibold text-white hover:bg-ops-blue-600 hover:shadow-ops-blue disabled:opacity-50"
          >
            {generando
              ? "Generando..."
              : cantidad > 0
                ? `Generar ${cantidad} ${cantidad === 1 ? "credencial" : "credenciales"} en PDF`
                : "Generar credenciales en PDF"}
          </button>
          {!listo && (
            <p className="text-sm text-ops-gray-500">
              Falta: {[
                cantidad === 0 && "cargar el Excel",
                !capacitacion && "elegir la capacitación",
                !instructor && "elegir el instructor",
                !fechaCapacitacion && "indicar la fecha",
              ]
                .filter(Boolean)
                .join(", ")}
              .
            </p>
          )}
        </div>

        {resultado && (
          <div className="space-y-3">
            <p className="text-sm text-[#157a42]">
              Listo: {resultado.cantidad} {resultado.cantidad === 1 ? "credencial generada" : "credenciales generadas"} en un único PDF.
            </p>
            <a
              href={resultado.url}
              download="credenciales.pdf"
              className="inline-flex rounded-ops-md bg-ops-success px-4 py-2 text-sm font-semibold text-white hover:bg-[#157a42]"
            >
              Descargar PDF
            </a>
            <iframe
              src={resultado.url}
              title="Vista previa de las credenciales"
              className="h-[480px] w-full rounded-ops-md border border-ops-border"
            />
          </div>
        )}
      </section>
    </div>
  );
}
