"use client";

const OPTIONS = [1, 2, 3, 4, 5];

const VALUE_COLORS = {
  1: { bg: "#dc2626", text: "#ffffff" },
  2: { bg: "#f97316", text: "#ffffff" },
  3: { bg: "#eab308", text: "#1e293b" },
  4: { bg: "#84cc16", text: "#1e293b" },
  5: { bg: "#16a34a", text: "#ffffff" },
};

export default function RatingInput({ label, name, value, onChange, required = true }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-base font-medium text-slate-800">{label}</legend>
      <div className="grid grid-cols-5 gap-2">
        {OPTIONS.map((option) => {
          const selected = value === option;
          const colors = VALUE_COLORS[option];
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(name, option)}
              style={{ backgroundColor: colors.bg, color: colors.text }}
              className={`flex h-12 items-center justify-center rounded-md text-lg font-semibold transition ${
                selected
                  ? "scale-105 ring-4 ring-slate-800 ring-offset-2"
                  : "opacity-55 hover:opacity-100"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>Muy en desacuerdo</span>
        <span>Muy de acuerdo</span>
      </div>
      {required && value == null && (
        <p className="text-xs text-slate-400">Seleccioná un valor de 1 a 5.</p>
      )}
    </fieldset>
  );
}
