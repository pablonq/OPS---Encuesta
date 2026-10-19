import { Roboto, Saira } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// Saira sustituye a Bahnschrift (la tipografía display de la marca) en la web.
const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Encuestas de Capacitación - OPS",
  description: "Encuesta de satisfacción para capacitaciones de operadores de campo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${roboto.variable} ${saira.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-ops-gray font-sans text-ops-navy antialiased">
        {children}
      </body>
    </html>
  );
}
