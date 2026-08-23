"use client";

export default function CapacitacionSelector({ capacitaciones, value, onChange }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-base font-medium text-slate-800">
        ¿Qué capacitación estás calificando?
      </legend>

      {capacitaciones.length === 0 ? (
        <p className="text-sm text-slate-500">
          Todavía no hay capacitaciones cargadas. Avisale a un administrador.
        </p>
      ) : (
        <div className="flex gap-2">
          {capacitaciones.map((capacitacion) => {
            const selected = value === capacitacion.id;
            return (
              <button
                key={capacitacion.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(capacitacion.id)}
                className={`flex-1 rounded-md border px-3 py-3 text-center text-sm font-medium leading-snug transition ${
                  selected
                    ? "border-[#008EC6] bg-[#008EC6] text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-[#008EC6]"
                }`}
              >
                {capacitacion.nombre}
              </button>
            );
          })}
        </div>
      )}

      {value == null && capacitaciones.length > 0 && (
        <p className="text-xs text-slate-400">Elegí una opción.</p>
      )}
    </fieldset>
  );
}
