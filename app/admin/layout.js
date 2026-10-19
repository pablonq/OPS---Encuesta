"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  GraduationCap,
  IdCard,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";

const NAV_GROUPS = [
  {
    group: "Principal",
    items: [{ href: "/admin", label: "Panel", icon: LayoutDashboard }],
  },
  {
    group: "Gestión",
    items: [
      { href: "/admin/capacitaciones", label: "Capacitaciones", icon: GraduationCap },
      { href: "/admin/instructores", label: "Instructores", icon: Users },
    ],
  },
  {
    group: "Seguimiento",
    items: [{ href: "/admin/respuestas", label: "Respuestas", icon: ClipboardList }],
  },
  {
    group: "Documentos",
    items: [{ href: "/admin/credenciales", label: "Credenciales", icon: IdCard }],
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  if (isLogin) {
    return <div className="flex flex-1 flex-col">{children}</div>;
  }

  const logo = (
    <Image src="/brand/ops-logo-white.png" alt="OPS" width={106} height={42} priority className="h-[42px] w-auto" />
  );

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      {/* Barra lateral (escritorio) */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col bg-ops-navy px-3.5 py-5 text-white md:flex">
        <div className="px-2 pb-5 pt-1.5">{logo}</div>

        <nav className="flex-1 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.group}>
              <div className="px-2.5 pb-1.5 pt-3.5 font-display text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                {group.group}
              </div>
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-[11px] rounded-ops-md px-3 py-2.5 text-sm transition duration-200 ${
                      active
                        ? "bg-ops-blue/[0.16] font-medium text-white before:absolute before:-left-3.5 before:bottom-2 before:top-2 before:w-[3px] before:rounded-r-[3px] before:bg-ops-blue before:content-['']"
                        : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <item.icon size={18} strokeWidth={1.75} className="shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 rounded-ops-md bg-white/5 p-2.5">
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-ops-blue font-display text-sm font-semibold">
            A
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[13px] font-medium">Administrador</div>
            <div className="text-[11px] text-white/50">Panel de encuestas</div>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="flex rounded-md p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} strokeWidth={1.75} />
          </button>
        </div>
      </aside>

      {/* Barra superior (celular) */}
      <header className="bg-ops-navy text-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          {logo}
          <button
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="flex items-center gap-1.5 rounded-ops-md px-2 py-1.5 text-[13px] text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Salir
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
          {NAV_GROUPS.flatMap((g) => g.items).map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[13px] ${
                  active ? "bg-ops-blue font-medium text-white" : "bg-white/[0.08] text-white/70"
                }`}
              >
                <item.icon size={15} strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
