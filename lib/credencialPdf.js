// Generador del PDF de credenciales. Replica el diseño de Canva (lienzo de 1920x1080 px):
// se dibuja con las mismas coordenadas y la página se escala a 0.75 (1440x810 pt),
// igual que el PDF exportado desde Canva. Una credencial por página.
//
// Es una función pura (recibe bytes de fuentes/imágenes) para poder usarla en el
// navegador y también probarla desde Node.

import {
  PDFDocument,
  rgb,
  pushGraphicsState,
  popGraphicsState,
  concatTransformationMatrix,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { formatFecha } from "./credenciales.js";

const W = 1920;
const H = 1080;
const ESCALA = 0.75;

const AZUL = rgb(0, 142 / 255, 198 / 255);
const NEGRO = rgb(0, 0, 0);
const BLANCO = rgb(1, 1, 1);
const GRIS = rgb(0.72, 0.72, 0.72);

// ---------- utilidades de texto ----------

function ancho(font, texto, size, spacing = 0) {
  if (!spacing) return font.widthOfTextAtSize(texto, size);
  const caracteres = [...texto];
  const suma = caracteres.reduce((acc, ch) => acc + font.widthOfTextAtSize(ch, size), 0);
  return suma + spacing * Math.max(0, caracteres.length - 1);
}

// `base` es la posición de la línea base medida desde arriba (como en Canva).
function texto(page, contenido, { x, base, font, size, spacing = 0, color = NEGRO, align = "left" }) {
  const total = ancho(font, contenido, size, spacing);
  let cursor = align === "center" ? x - total / 2 : align === "right" ? x - total : x;
  const y = H - base;

  if (!spacing) {
    page.drawText(contenido, { x: cursor, y, font, size, color });
    return;
  }
  for (const ch of contenido) {
    page.drawText(ch, { x: cursor, y, font, size, color });
    cursor += font.widthOfTextAtSize(ch, size) + spacing;
  }
}

function envolver(font, contenido, size, spacing, maxAncho) {
  const lineas = [];
  for (const parrafo of String(contenido).split(/\r?\n/)) {
    const palabras = parrafo.split(/\s+/).filter(Boolean);
    let actual = "";
    for (const palabra of palabras) {
      const prueba = actual ? `${actual} ${palabra}` : palabra;
      if (!actual || ancho(font, prueba, size, spacing) <= maxAncho) actual = prueba;
      else {
        lineas.push(actual);
        actual = palabra;
      }
    }
    if (actual) lineas.push(actual);
  }
  return lineas;
}

// Reduce el tamaño hasta que el texto entre en maxAncho (el espaciado se escala con el tamaño).
function ajustar(font, contenido, sizeBase, sizeMin, spacingBase, maxAncho) {
  let size = sizeBase;
  const spacingDe = (s) => spacingBase * (s / sizeBase);
  while (size > sizeMin && ancho(font, contenido, size, spacingDe(size)) > maxAncho) size -= 1;
  return { size, spacing: spacingDe(size) };
}

function limitar(valor, min, max) {
  return Math.min(max, Math.max(min, valor));
}

// ---------- utilidades gráficas ----------

function rectanguloRedondeado(page, { x, top, w, h, r, fill, borde, grosor = 0 }) {
  const d =
    `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} ` +
    `H ${r} A ${r} ${r} 0 0 1 0 ${h - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
  page.drawSvgPath(d, {
    x,
    y: H - top,
    color: fill,
    borderColor: borde,
    borderWidth: grosor,
  });
}

async function incrustarImagen(pdfDoc, bytes) {
  if (!bytes) return null;
  const esPng = bytes[0] === 0x89 && bytes[1] === 0x50;
  return esPng ? pdfDoc.embedPng(bytes) : pdfDoc.embedJpg(bytes);
}

export function dataUrlABytes(dataUrl) {
  const base64 = String(dataUrl).split(",")[1] || "";
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

// Dibuja una imagen dentro de un recuadro, centrada y sin deformarla.
function imagenEnCaja(page, imagen, { x, top, w, h }) {
  const factor = Math.min(w / imagen.width, h / imagen.height);
  const dw = imagen.width * factor;
  const dh = imagen.height * factor;
  page.drawImage(imagen, {
    x: x + (w - dw) / 2,
    y: H - top - h + (h - dh) / 2,
    width: dw,
    height: dh,
  });
}

// ---------- logo ----------

function dibujarLogoVectorial(page, fonts) {
  const box = { x: 1488, top: 32, w: 396, h: 135 };
  rectanguloRedondeado(page, { ...box, r: 28, fill: BLANCO, borde: AZUL, grosor: 4 });

  // "OPS": letras anchas, achatadas horizontalmente como en el logo original.
  const sizeOps = 56;
  const espOps = 14;
  const natural = ancho(fonts.black, "OPS", sizeOps);
  const objetivo = 205;
  const sx = (objetivo - 2 * espOps) / natural;
  const x0 = box.x + (box.w - objetivo) / 2;

  page.pushOperators(pushGraphicsState(), concatTransformationMatrix(sx, 0, 0, 1, x0, 0));
  let cursor = 0;
  for (const ch of "OPS") {
    page.drawText(ch, { x: cursor, y: H - 101, font: fonts.black, size: sizeOps, color: AZUL });
    cursor += fonts.black.widthOfTextAtSize(ch, sizeOps) + espOps / sx;
  }
  page.pushOperators(popGraphicsState());

  const sub = "Oilfield Production Services";
  const sizeSub = 26;
  const espSub = limitar((334 - ancho(fonts.regular, sub, sizeSub)) / (sub.length - 1), 0, 3);
  texto(page, sub, {
    x: box.x + box.w / 2,
    base: 140,
    font: fonts.regular,
    size: sizeSub,
    spacing: espSub,
    color: AZUL,
    align: "center",
  });
}

// ---------- credencial ----------

function dibujarCredencial(page, ctx, persona) {
  const { fonts, calibracion, capacitacion, instructor, imagenes, fechas, incluirFoto } = ctx;

  page.pushOperators(pushGraphicsState(), concatTransformationMatrix(ESCALA, 0, 0, ESCALA, 0, 0));

  // Marca de agua (opcional) detrás de todo.
  if (imagenes.marcaAgua) {
    imagenEnCaja(page, imagenes.marcaAgua, { x: 1020, top: 165, w: 790, h: 865 });
  }

  // Título "CREDENCIAL": ocupa de x=530 a x=1395.
  const titulo = "CREDENCIAL";
  const espTitulo = (865 - ancho(fonts.black, titulo, 112)) / (titulo.length - 1);
  texto(page, titulo, { x: 530, base: 137, font: fonts.black, size: 112, spacing: espTitulo });

  // Logo.
  if (imagenes.logo) imagenEnCaja(page, imagenes.logo, { x: 1488, top: 32, w: 396, h: 135 });
  else dibujarLogoVectorial(page, fonts);

  // Recuadro azul con el nombre de la capacitación.
  rectanguloRedondeado(page, { x: 45, top: 181, w: 863, h: 207, r: 30, fill: AZUL });
  const nombre = capacitacion.nombre;
  const centroX = 45 + 863 / 2;
  const unaLinea = ajustar(fonts.regular, nombre, 56, 40, 0, 780);
  if (ancho(fonts.regular, nombre, unaLinea.size) <= 780) {
    texto(page, nombre, {
      x: centroX,
      base: 303,
      font: fonts.regular,
      size: unaLinea.size,
      color: BLANCO,
      align: "center",
    });
  } else {
    const lineas = envolver(fonts.regular, nombre, 44, 0, 780).slice(0, 3);
    const interlinea = 54;
    const primera = 284 - ((lineas.length - 1) * interlinea) / 2 + 15;
    lineas.forEach((linea, i) =>
      texto(page, linea, {
        x: centroX,
        base: primera + i * interlinea,
        font: fonts.regular,
        size: 44,
        color: BLANCO,
        align: "center",
      })
    );
  }

  // Marco de foto (opcional).
  if (incluirFoto) {
    page.drawRectangle({
      x: 142,
      y: H - 484 - 336,
      width: 284,
      height: 336,
      borderColor: GRIS,
      borderWidth: 2,
    });
  }

  // Datos de la persona.
  const X = 492;
  const MAX_VALOR = 510;
  const bloques = [
    { label: "Apellido y Nombre", valor: `${persona.apellido} ${persona.nombres}`.toUpperCase(), base: 457 },
    { label: "DNI", valor: persona.dni, base: 559 },
    { label: "Fecha de Capacitación", valor: fechas.capacitacion, base: 658 },
    { label: "Fecha Vencimiento", valor: fechas.vencimiento, base: 760 },
    { label: "Tarea", valor: persona.tarea.toUpperCase(), base: 856 },
  ];

  bloques.forEach((bloque, indice) => {
    texto(page, bloque.label, {
      x: X,
      base: bloque.base,
      font: fonts.regular,
      size: 28,
      spacing: calibracion.espLabel,
    });

    const esNombre = indice === 0;
    const sizeValor = 31;
    const baseValor = bloque.base + 34;

    if (esNombre) {
      // Si no entra en una línea, pasa a dos líneas con letra un poco más chica.
      let size = sizeValor;
      let lineas = envolver(fonts.bold, bloque.valor, size, calibracion.espValor, MAX_VALOR);
      if (lineas.length > 1) size = 28;
      while (size > 18) {
        lineas = envolver(fonts.bold, bloque.valor, size, calibracion.espValor * (size / sizeValor), MAX_VALOR);
        if (lineas.length <= 2) break;
        size -= 1;
      }
      lineas.slice(0, 2).forEach((linea, i) =>
        texto(page, linea, {
          x: X,
          base: baseValor + i * (size + 4),
          font: fonts.bold,
          size,
          spacing: calibracion.espValor * (size / sizeValor),
        })
      );
    } else {
      const { size, spacing } = ajustar(fonts.bold, bloque.valor, sizeValor, 20, calibracion.espValor, MAX_VALOR);
      texto(page, bloque.valor, { x: X, base: baseValor, font: fonts.bold, size, spacing });
    }
  });

  // Columna derecha: carga horaria + descripción.
  const centroDerecha = 1415;
  if (capacitacion.carga_horaria) {
    const horas = String(capacitacion.carga_horaria).replace(".", ",");
    texto(page, `Carga Horaria: ${horas}hs Teoria - Practica`, {
      x: centroDerecha,
      base: 422,
      font: fonts.bold,
      size: 30,
      align: "center",
    });
  }
  if (capacitacion.descripcion) {
    envolver(fonts.bold, capacitacion.descripcion, 30, 0, 370)
      .slice(0, 5)
      .forEach((linea, i) =>
        texto(page, linea, {
          x: centroDerecha + 5,
          base: 550 + i * 41,
          font: fonts.bold,
          size: 30,
          align: "center",
        })
      );
  }

  // Instructor: etiqueta, firma y nombre.
  texto(page, "Instructor", {
    x: centroDerecha,
    base: 770,
    font: fonts.regular,
    size: 28,
    spacing: calibracion.espLabel,
    align: "center",
  });

  let baseNombre = 850;
  if (imagenes.firma) {
    imagenEnCaja(page, imagenes.firma, { x: centroDerecha - 170, top: 782, w: 340, h: 110 });
    baseNombre = 925;
  }
  envolver(fonts.regular, instructor.nombre_apellido, 34, 0, 440)
    .slice(0, 2)
    .forEach((linea, i) =>
      texto(page, linea, {
        x: centroDerecha,
        base: baseNombre + i * 38,
        font: fonts.regular,
        size: 34,
        align: "center",
      })
    );

  // Procedimientos (abajo a la izquierda).
  if (capacitacion.procedimientos) {
    envolver(fonts.regular, capacitacion.procedimientos, 21, 0, 800)
      .slice(0, 4)
      .forEach((linea, i) =>
        texto(page, linea, { x: 157, base: 976 + i * 30, font: fonts.regular, size: 21 })
      );
  }

  page.pushOperators(popGraphicsState());
}

// ---------- API pública ----------

export async function generarCredencialesPdf({
  credenciales,
  capacitacion,
  instructor,
  fechaCapacitacion,
  fechaVencimiento,
  incluirFoto = true,
  assets,
}) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  pdfDoc.setTitle("Credenciales");
  pdfDoc.setCreator("OPS - Encuestas de Capacitación");

  const fonts = {
    regular: await pdfDoc.embedFont(assets.fonts.regular, { subset: true }),
    bold: await pdfDoc.embedFont(assets.fonts.bold, { subset: true }),
    black: await pdfDoc.embedFont(assets.fonts.black, { subset: true }),
  };

  // Espaciado entre letras calibrado contra el diseño original de Canva.
  const calibracion = {
    espLabel: limitar((303 - fonts.regular.widthOfTextAtSize("Apellido y Nombre", 28)) / 16, 0, 8),
    espValor: limitar((411 - fonts.bold.widthOfTextAtSize("CECILIA GUILLERMINA", 31)) / 18, 0, 8),
  };

  const imagenes = {
    logo: await incrustarImagen(pdfDoc, assets.logo),
    marcaAgua: await incrustarImagen(pdfDoc, assets.marcaAgua),
    firma: instructor.firma ? await incrustarImagen(pdfDoc, dataUrlABytes(instructor.firma)) : null,
  };

  const ctx = {
    fonts,
    calibracion,
    capacitacion,
    instructor,
    imagenes,
    incluirFoto,
    fechas: { capacitacion: formatFecha(fechaCapacitacion), vencimiento: formatFecha(fechaVencimiento) },
  };

  for (const persona of credenciales) {
    const page = pdfDoc.addPage([W * ESCALA, H * ESCALA]);
    dibujarCredencial(page, ctx, persona);
  }

  return pdfDoc.save();
}
