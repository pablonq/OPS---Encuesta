// Pastilla de estado: ok = Vigente, warn = Por vencer, bad = Vencida, info, neutral.

const KINDS = {
  ok: { box: "bg-ops-success-bg text-[#157a42]", dot: "bg-ops-success" },
  warn: { box: "bg-ops-warning-bg text-[#a9690a]", dot: "bg-ops-warning" },
  bad: { box: "bg-ops-danger-bg text-[#b32d2d]", dot: "bg-ops-danger" },
  info: { box: "bg-ops-blue-50 text-ops-blue-700", dot: "bg-ops-blue" },
  neutral: { box: "bg-ops-gray text-ops-gray-700", dot: "bg-ops-gray-500" },
};

export default function Badge({ kind = "neutral", dot = false, children }) {
  const k = KINDS[kind] ?? KINDS.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-[11px] py-1 text-xs font-medium ${k.box}`}
    >
      {dot && <span className={`h-[7px] w-[7px] rounded-full ${k.dot}`} />}
      {children}
    </span>
  );
}
