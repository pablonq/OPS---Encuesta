// Helper de fetch para el cliente: lanza un error con el mensaje del backend
// cuando la respuesta no es 2xx, en vez de devolver silenciosamente el JSON
// de error como si fueran datos válidos.
export async function fetchJson(input, init) {
  const response = await fetch(input, init);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Error ${response.status}`);
  }
  return payload;
}
