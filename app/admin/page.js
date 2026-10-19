"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardList, GraduationCap, QrCode, Users } from "lucide-react";
import { fetchJson } from "@/lib/fetchJson";
import KpiCard from "@/components/ui/KpiCard";
import PageHeader from "@/components/ui/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import { cardClass } from "@/lib/ui";

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

  const valor = (n) => (loading ? "—" : n);

  return (
    <div>
      <PageHeader
        eyebrow="Panel de encuestas"
        title="Resumen general"
        description="Capacitaciones, instructores y respuestas recibidas de los operadores."
      />

      {error && (
        <p className="mb-6 rounded-ops-md border border-ops-danger/30 bg-ops-danger-bg p-3 text-sm text-[#b32d2d]">
          {error}
        </p>
      )}

      <section className="mb-6 grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        <KpiCard icon={GraduationCap} value={valor(capacitaciones.length)} label="Capacitaciones" />
        <KpiCard icon={Users} value={valor(instructores.length)} label="Instructores" />
        <KpiCard icon={ClipboardList} value={valor(respuestasCount)} label="Respuestas recibidas" tone="ok" />
      </section>

      <section className={`${cardClass} flex flex-wrap items-center gap-5 p-6`}>
        <div className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-ops-blue-50 text-ops-blue">
          <QrCode size={26} strokeWidth={1.75} />
        </div>
        <div className="min-w-[240px] flex-1">
          <h2 className="font-display text-base font-semibold text-ops-navy">QR de encuesta</h2>
          <p className="mt-1 text-sm text-ops-gray-500">
            Cada instructor tiene un QR fijo que lleva impreso a todas sus capacitaciones. Al
            escanearlo, el operador elige qué capacitación está calificando.
          </p>
        </div>
        <Link href="/admin/instructores" className={buttonClasses({ capsule: true })}>
          Ver e imprimir QR de instructores
        </Link>
      </section>
    </div>
  );
}
