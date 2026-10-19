"use client";

export default function CapacitacionSelector({ capacitaciones, value, onChange }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-base font-medium text-ops-navy">
        ¿Qué capacitación estás calificando?
      </legend>

      {capacitaciones.length === 0 ? (
        <p className="text-sm text-ops-gray-500">
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
                className={`flex-1 rounded-ops-md border px-3 py-3 text-center text-sm font-medium leading-snug transition ${
                  selected
                    ? "border-ops-blue bg-ops-blue text-white"
                    : "border-ops-border-2 bg-white text-ops-gray-700 hover:border-ops-blue"
                }`}
              >
                {capacitacion.nombre}
              </button>
            );
          })}
        </div>
      )}

      {value == null && capacitaciones.length > 0 && (
        <p className="text-xs text-ops-gray-400">Elegí una opción.</p>
      )}
    </fieldset>
  );
}
