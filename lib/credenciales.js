// Lectura y validación de las filas del Excel de credenciales (sin dependencias de UI).
// Columnas requeridas: Apellido, Nombres, DNI, Tarea.

const COLUMNAS = [
  { key: "apellido", label: "Apellido", aliases: ["apellido", "apellidos"] },
  { key: "nombres", label: "Nombres", aliases: ["nombres", "nombre"] },
  { key: "dni", label: "DNI", aliases: ["dni", "documento"] },
  { key: "tarea", label: "Tarea", aliases: ["tarea", "tareas"] },
];

function normalizar(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

function celdaATexto(valor) {
  if (valor === null || valor === undefined) return "";
  if (valor instanceof Date) return "";
  return String(valor).replace(/\s+/g, " ").trim();
}

function normalizarDni(valor) {
  const texto = celdaATexto(valor);
  // 36.871.091 / "36 871 091" → 36871091. Si trae letras (pasaporte, etc.) se respeta tal cual.
  return /^[\d.\s]+$/.test(texto) ? texto.replace(/[.\s]/g, "") : texto;
}

// rows: matriz de filas (la primera es el encabezado), tal como la devuelve readSheet().
export function parseCredencialesRows(rows) {
  const resultado = { credenciales: [], errores: [], advertencias: [] };

  if (!Array.isArray(rows) || rows.length === 0) {
    resultado.errores.push("El archivo está vacío.");
    return resultado;
  }

  const encabezado = rows[0].map(normalizar);
  const indices = {};
  const faltantes = [];

  for (const columna of COLUMNAS) {
    const indice = encabezado.findIndex((h) => columna.aliases.includes(h));
    if (indice === -1) faltantes.push(columna.label);
    else indices[columna.key] = indice;
  }

  if (faltantes.length > 0) {
    resultado.errores.push(
      `Faltan columnas en la fila 1: ${faltantes.join(", ")}. Usá el modelo descargable.`
    );
    return resultado;
  }

  const dnisVistos = new Set();

  rows.slice(1).forEach((fila, i) => {
    const numeroFila = i + 2; // fila real en Excel
    const valores = {
      apellido: celdaATexto(fila[indices.apellido]),
      nombres: celdaATexto(fila[indices.nombres]),
      dni: normalizarDni(fila[indices.dni]),
      tarea: celdaATexto(fila[indices.tarea]),
    };

    if (Object.values(valores).every((v) => v === "")) return; // fila vacía

    const vacios = COLUMNAS.filter((c) => !valores[c.key]).map((c) => c.label);
    if (vacios.length > 0) {
      resultado.errores.push(`Fila ${numeroFila}: falta ${vacios.join(", ")}.`);
      return;
    }

    if (dnisVistos.has(valores.dni)) {
      resultado.advertencias.push(`Fila ${numeroFila}: el DNI ${valores.dni} está repetido.`);
    }
    dnisVistos.add(valores.dni);

    resultado.credenciales.push(valores);
  });

  if (resultado.credenciales.length === 0 && resultado.errores.length === 0) {
    resultado.errores.push("No se encontraron filas con datos.");
  }

  return resultado;
}

// "2026-06-02" → "02/06/2026"
export function formatFecha(iso) {
  if (!iso) return "";
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

// Suma años a una fecha ISO (YYYY-MM-DD); el 29/02 pasa al 28/02 si el año destino no es bisiesto.
export function sumarAnios(iso, anios) {
  if (!iso) return "";
  const [anio, mes, dia] = iso.split("-").map(Number);
  const destino = new Date(Date.UTC(anio + anios, mes - 1, dia));
  if (destino.getUTCMonth() !== mes - 1) destino.setUTCDate(0);
  return destino.toISOString().slice(0, 10);
}
