// Encabezado de página: eyebrow (azul, en mayúsculas), título y descripción opcional.

export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-ops-blue">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[28px] font-semibold leading-[1.05] text-ops-navy">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-ops-gray-500">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
