import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md space-y-4 rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Sistema de Encuestas de Capacitación
        </h1>
        <p className="text-sm text-slate-600">
          Los operadores acceden a la encuesta escaneando el código QR entregado al
          finalizar cada capacitación.
        </p>
        <Link
          href="/admin"
          className="inline-flex rounded-md bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
        >
          Ir al panel de administración
        </Link>
      </div>
    </main>
  );
}
