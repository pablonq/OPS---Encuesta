// Botón del sistema de diseño OPS: primary / secondary / ghost / danger.
// `capsule` = forma de cápsula (pill), reservada para CTAs de impacto.

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium leading-none transition duration-200 disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS = {
  primary:
    "bg-ops-blue text-white hover:bg-ops-blue-600 hover:shadow-ops-blue active:translate-y-px active:bg-ops-blue-700",
  secondary:
    "border border-ops-border-2 bg-white text-ops-navy hover:border-ops-blue-200 hover:bg-ops-blue-50 hover:text-ops-blue-700",
  ghost: "text-ops-blue hover:bg-ops-blue-50",
  danger: "bg-ops-danger-bg text-[#b32d2d] hover:bg-[#f6dada]",
};

const SIZES = {
  md: "px-4 py-2.5 text-sm",
  sm: "px-3 py-[7px] text-[13px]",
};

// Útil para aplicar el estilo de botón a un <Link> o <a>.
export function buttonClasses({ variant = "primary", size = "md", capsule = false, block = false } = {}) {
  return [
    BASE,
    VARIANTS[variant] ?? VARIANTS.primary,
    SIZES[size] ?? SIZES.md,
    capsule ? "rounded-full px-6" : "rounded-ops-md",
    block ? "w-full" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function Button({
  variant,
  size,
  capsule,
  block,
  type = "button",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={`${buttonClasses({ variant, size, capsule, block })} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
