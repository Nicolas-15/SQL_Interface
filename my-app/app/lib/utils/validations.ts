/**
 * Valida un RUT chileno (con o sin puntos y guión)
 * @param rut string
 * @returns boolean
 */
export function validarRut(rut: string): boolean {
  if (!/^[0-9]+-[0-9kK]{1}$/.test(rut.replace(/\./g, ""))) return false;

  const tmp = rut.replace(/\./g, "").split("-");
  let digv = tmp[1];
  const cuerpo = tmp[0];

  if (digv === "K") digv = "k";

  return dv(cuerpo) === digv;
}

/**
 * Calcula el dígito verificador de un RUT
 * @param T número sin DV
 * @returns dígito verificador
 */
function dv(T: string): string {
  let M = 0,
    S = 1;
  let t = parseInt(T);
  for (; t; t = Math.floor(t / 10)) S = (S + (t % 10) * (9 - (M++ % 6))) % 11;
  return S ? (S - 1).toString() : "k";
}

/**
 * Formatea un RUT a 12.345.678-9
 * @param rut string
 * @returns string formateado
 */
export function formatRut(rut: string): string {
  // Limpiar puntos y guiones, y limitar a 9 caracteres (cuerpo + DV)
  let value = rut.replace(/\./g, "").replace(/-/g, "").replace(/\s/g, "");

  // Solo permitir números y K/k
  value = value.replace(/[^0-9kK]/g, "");

  // Limitar a un máximo de 9 caracteres (ej: 12.345.678-9)
  value = value.slice(0, 9);

  if (value.length < 2) return value;

  const cuerpo = value.slice(0, -1);
  const dv = value.slice(-1).toUpperCase();

  let result = "";
  for (let i = cuerpo.length - 1, j = 0; i >= 0; i--, j++) {
    result = cuerpo.charAt(i) + (j > 0 && j % 3 === 0 ? "." : "") + result;
  }

  return result + "-" + dv;
}

/**
 * Formatea un RUT para búsqueda en DB (9 dígitos con ceros a la izquierda + guión + DV)
 * Ejemplo: 5.975.392-4 -> 005975392-4
 * @param rut string
 * @returns string formateado para DB
 */
export function formatRutForDb(rut: string): string {
  if (!rut) return "";
  const clean = rut.replace(/\./g, "").replace(/\s/g, "");
  const parts = clean.split("-");
  if (parts.length === 0) return "";

  const cuerpo = parts[0].padStart(9, "0");
  const dv = parts.length > 1 ? "-" + parts[1].toUpperCase() : "";

  return cuerpo + dv;
}
