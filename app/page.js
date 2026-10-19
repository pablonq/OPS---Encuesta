import Link from "next/link";
import Image from "next/image";
import { LogIn } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-ops-gray before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(900px_500px_at_80%_-10%,#e8f6fc,transparent_60%)]">
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <div className="max-w-[560px] text-center">
          <Image
            src="/brand/ops-logo-blue.png"
            alt="OPS - Oilfield Production Services"
            width={280}
            height={96}
            priority
            className="mx-auto mb-8 h-24 w-auto"
          />
          <h1 className="mb-4 font-display text-4xl font-light leading-[1.1] text-ops-navy sm:text-[42px]">
            Sistema de Encuestas de Capacitación
          </h1>
          <p className="mx-auto mb-8 max-w-[460px] text-[17px] leading-relaxed text-ops-gray-700">
            Los operadores acceden a la encuesta escaneando el código QR entregado al finalizar cada
            capacitación.
          </p>
          <Link
            href="/admin"
            className={`${buttonClasses({ capsule: true })} !px-7 !py-3.5 !text-[15px]`}
          >
            <LogIn size={16} strokeWidth={1.75} />
            Ingresar al panel de administración
          </Link>
        </div>
      </div>
      <footer className="relative z-10 px-6 py-5 text-center text-xs text-ops-gray-500">
        © 2026 Oilfield Production Services SRL · Neuquén, Argentina
      </footer>
    </main>
  );
}
