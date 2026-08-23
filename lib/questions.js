// Preguntas de valoración (escala 1 a 5) de la encuesta de capacitación.
// El campo "field" es camelCase (API/JS) y se mapea a snake_case en la
// tabla `respuestas` de Supabase.

export const RATING_QUESTIONS = [
  {
    field: "dominioTema",
    column: "dominio_tema",
    label:
      "El instructor demostró dominio del tema y respondió con solvencia las consultas y dudas que surgieron.",
  },
  {
    field: "claridadConceptos",
    column: "claridad_conceptos",
    label: "¿Qué te pareció la claridad del instructor/a para explicar los conceptos?",
  },
  {
    field: "respetoHorarios",
    column: "respeto_horarios",
    label: "Se respetaron los horarios de inicio, cortes y finalización.",
  },
  {
    field: "calidadMaterial",
    column: "calidad_material",
    label: "Considera que la duración y el material de apoyo fueron apropiados.",
  },
  {
    field: "aplicabilidad",
    column: "aplicabilidad",
    label: "Considera que lo aprendido puede aplicarlo en su tarea diaria.",
  },
];

export const RATING_FIELDS = RATING_QUESTIONS.map((q) => q.field);
