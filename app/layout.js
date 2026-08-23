import "./globals.css";

export const metadata = {
  title: "Encuestas de Capacitación - OPS",
  description: "Encuesta de satisfacción para capacitaciones de operadores de campo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
