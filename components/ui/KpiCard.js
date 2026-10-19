// Tarjeta de indicador del dashboard: ícono en cápsula tintada + numeral grande + etiqueta.

const TONES = {
  blue: "bg-ops-blue-50 text-ops-blue",
  warn: "bg-ops-warning-bg text-ops-warning",
  ok: "bg-ops-success-bg text-ops-success",
};

export default function KpiCard({ icon: Icon, value, label, note, tone = "blue" }) {
  return (
    <div className="rounded-ops-lg border border-ops-border bg-white p-5 shadow-ops-sm transition-shadow duration-200 hover:shadow-ops-md">
      {Icon && (
        <div className={`mb-4 flex h-[42px] w-[42px] items-center justify-center rounded-xl ${TONES[tone] ?? TONES.blue}`}>
          <Icon size={22} strokeWidth={1.75} />
        </div>
      )}
      <div className="font-display text-4xl font-semibold leading-none text-ops-navy">{value}</div>
      <div className="mt-1.5 text-[13px] text-ops-gray-500">{label}</div>
      {note && <div className="mt-2.5 text-xs text-ops-blue">{note}</div>}
    </div>
  );
}
