"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import { inputClass, labelClass } from "@/lib/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "No se pudo iniciar sesión");
      }
      const next = searchParams.get("next") || "/admin";
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-[400px] rounded-ops-xl border border-ops-border bg-white px-8 pb-8 pt-8 shadow-ops-lg"
    >
      <div className="mb-6 text-center">
        <Image
          src="/brand/ops-logo-blue.png"
          alt="OPS - Oilfield Production Services"
          width={170}
          height={58}
          priority
          className="mx-auto mb-4 h-[58px] w-auto"
        />
        <h1 className="font-display text-[21px] font-semibold text-ops-navy">Acceso administración</h1>
        <p className="mt-1 text-[13px] text-ops-gray-500">Encuestas de Capacitación</p>
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Contraseña
        </label>
        <div className="relative flex items-center">
          <Lock size={16} className="pointer-events-none absolute left-3 mt-1.5 text-ops-gray-500" />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-ops-danger">{error}</p>}

      <Button type="submit" capsule block disabled={loading} className="mt-5">
        {loading ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden bg-ops-gray px-4 py-10 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(900px_500px_at_80%_-10%,#e8f6fc,transparent_60%)]">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
