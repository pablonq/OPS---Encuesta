"use client";

import { useState } from "react";
import { RATING_QUESTIONS } from "@/lib/questions";
import RatingInput from "@/components/RatingInput";
import CapacitacionSelector from "@/components/CapacitacionSelector";

export default function EncuestaForm({ instructorId, capacitaciones }) {
  const [capacitacionId, setCapacitacionId] = useState(null);
  const [ratings, setRatings] = useState({});
  const [observaciones, setObservaciones] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function handleRatingChange(field, value) {
    setRatings((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!capacitacionId) {
      setError("Elegí qué capacitación estás calificando.");
      return;
    }

    const missing = RATING_QUESTIONS.find((q) => !ratings[q.field]);
    if (missing) {
      setError("Por favor respondé todas las preguntas antes de enviar.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/respuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capacitacionId,
          instructorId,
          ...ratings,
          observaciones,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "No se pudo enviar la encuesta");
      }

      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-ops-lg border border-ops-success/30 bg-ops-success-bg p-6 text-center">
        <p className="text-lg font-semibold text-[#157a42]">¡Gracias por tu respuesta!</p>
        <p className="mt-2 text-sm text-[#157a42]">
          Tu opinión nos ayuda a mejorar las próximas capacitaciones.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <CapacitacionSelector
        capacitaciones={capacitaciones}
        value={capacitacionId}
        onChange={setCapacitacionId}
      />

      {RATING_QUESTIONS.map((question) => (
        <RatingInput
          key={question.field}
          label={question.label}
          name={question.field}
          value={ratings[question.field]}
          onChange={handleRatingChange}
        />
      ))}

      <div className="space-y-2">
        <label htmlFor="observaciones" className="block text-base font-medium text-ops-navy">
          Observaciones (opcional)
        </label>
        <textarea
          id="observaciones"
          rows={4}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          className="w-full rounded-ops-md border border-ops-border-2 p-3 text-sm focus:border-ops-blue focus:outline-none focus:ring-[3px] focus:ring-ops-blue/20"
          placeholder="Comentarios, sugerencias, temas para futuras capacitaciones..."
        />
      </div>

      {error && (
        <p className="rounded-ops-md bg-ops-danger-bg p-3 text-sm text-[#b32d2d] border border-ops-danger/30">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || capacitaciones.length === 0}
        className="w-full rounded-ops-md bg-ops-blue px-4 py-3 text-base font-semibold text-white transition hover:bg-ops-blue-600 hover:shadow-ops-blue disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Enviando..." : "Enviar encuesta"}
      </button>
    </form>
  );
}
