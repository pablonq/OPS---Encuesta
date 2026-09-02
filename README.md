# Encuestas de Capacitación - OPS

Aplicación web para que los operadores de campo completen una encuesta de
satisfacción al finalizar cada capacitación, escaneando un código QR desde el
teléfono.

El sistema centraliza la evaluación de las capacitaciones de OPS y permite
obtener información ordenada sobre la experiencia de los participantes. Está
pensado para un uso simple y rápido en el lugar de la capacitación: el
instructor dispone de un código QR fijo, los operadores responden desde su
celular sin iniciar sesión y el equipo responsable consulta los resultados
desde un panel protegido.

## ¿Qué permite hacer?

- Administrar el catálogo de capacitaciones, incluyendo nombre, carga horaria
  y observaciones.
- Registrar instructores y asociar sus datos a los formularios de evaluación.
- Generar e imprimir un código QR permanente para cada instructor. El QR abre
  el formulario público correspondiente en `/encuesta/[instructorId]`.
- Permitir que cada operador seleccione la capacitación que está evaluando y
  califique cinco aspectos de la experiencia en una escala de 1 a 5:
  dominio del tema, claridad de los conceptos, respeto de los horarios,
  calidad del material y aplicabilidad en la tarea diaria.
- Recibir observaciones abiertas junto con las valoraciones numéricas.
- Consultar las respuestas desde el panel administrativo, filtrarlas por
  capacitación o instructor, revisar promedios y exportar los datos a CSV.

## Flujo de uso

1. El administrador inicia sesión en el panel y carga las capacitaciones e
   instructores disponibles.
2. Desde la sección de instructores genera o imprime el QR del instructor que
   dictará la actividad.
3. Al finalizar la capacitación, los operadores escanean el QR, seleccionan la
   capacitación correspondiente y completan la encuesta desde su teléfono.
4. Las respuestas se almacenan asociadas a la capacitación, el instructor y la
   fecha de envío.
5. El equipo administrativo revisa los resultados y descarga la información
   para su seguimiento o análisis posterior.

La aplicación separa la experiencia pública de los operadores del área de
gestión interna. El formulario de encuesta está optimizado para dispositivos
móviles, mientras que el panel administrativo concentra la carga de datos, la
generación de QR y la consulta de resultados.

- **Frontend:** Next.js (App Router) + React + TailwindCSS, JavaScript puro (sin TypeScript).
- **Backend:** API Routes de Next.js.
- **Base de datos:** Supabase (Postgres).
- **Despliegue:** Compatible con Vercel.

## Modelo de datos

- `capacitaciones`: id, nombre, carga_horaria, observacion.
- `instructores`: id, nombre_apellido, observaciones.
- `respuestas`: id, capacitacion_id, instructor_id, dominio_tema,
  claridad_conceptos, respeto_horarios, calidad_material, aplicabilidad
  (1 a 5), observaciones, creada_en.

Una misma capacitación puede tener varias instancias con distintos
instructores y fechas: cada respuesta queda asociada a la capacitación, al
instructor y a la fecha en que se completó (`creada_en`).

## 1. Crear el proyecto en Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. Andá a **SQL Editor** y ejecutá el contenido de [`supabase/schema.sql`](supabase/schema.sql)
   para crear las tablas.
3. En **Project Settings → API** copiá:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key (secreta) → `SUPABASE_SERVICE_ROLE_KEY`

La app solo accede a Supabase desde las API routes del servidor usando la
`service_role` key; nunca se expone al navegador.

## 2. Configurar variables de entorno

Copiá `.env.example` a `.env.local` y completá los valores:

```bash
cp .env.example .env.local
```

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: del paso anterior.
- `ADMIN_PASSWORD`: contraseña para entrar al panel `/admin` (protección
  simple por cookie, pensada para uso interno del equipo; no reemplaza un
  sistema de usuarios completo).
- `ADMIN_SESSION_SECRET`: cadena aleatoria larga, usada para firmar la cookie
  de sesión del panel.

## 3. Desarrollo local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000/admin](http://localhost:3000/admin) para entrar
al panel (te va a pedir la contraseña `ADMIN_PASSWORD`).

## 4. Uso

1. En **Capacitaciones** cargá los cursos (nombre, carga horaria, observación).
2. En **Instructores** cargá quién dicta cada capacitación.
3. En el **Panel** principal, elegí la capacitación y el instructor de la
   sesión del día y generá el código QR. Ese link (`/encuesta/[capacitacionId]/[instructorId]`)
   es el que escanean los operadores desde el celular al finalizar.
4. En **Respuestas** podés filtrar por capacitación/instructor, ver los
   promedios de cada pregunta y exportar todo a CSV.

## 5. Despliegue en Vercel

1. Subí el proyecto a un repositorio Git y conectalo en Vercel.
2. Configurá las mismas variables de entorno (`SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`) en
   **Project Settings → Environment Variables**.
3. Desplegá. Los QR generados usan el dominio desde el que se abre el panel
   (`window.location.origin`), así que van a apuntar automáticamente a la
   URL de producción.
