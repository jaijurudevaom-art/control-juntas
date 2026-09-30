const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const DIAS = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado',
]

// Recibe 'YYYY-MM-DD' (de un <input type=date>) y evita problemas de zona horaria
function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function fechaLarga(iso) {
  const d = parseISODate(iso)
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

export function fechaConDia(iso) {
  const d = parseISODate(iso)
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`
}

export function diaSemana(iso) {
  const d = parseISODate(iso)
  return DIAS[d.getDay()]
}

// 'HH:MM:SS' (como lo regresa Postgres) -> 'HH:MM'
export function horaSinSegundos(hhmmss) {
  if (!hhmmss) return ''
  return hhmmss.slice(0, 5)
}

export function horaAmPm(hhmm) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const suf = h < 12 ? 'a. m.' : 'p. m.'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${suf}`
}

// Convierte "Informe de actividades..." en "informe de actividades..." (sin punto final)
// para insertarlo dentro de la frase "...aprueba <esto>."
export function tituloParaFrase(titulo) {
  const sinPuntoFinal = titulo.trim().replace(/\.+$/, '')
  return sinPuntoFinal.charAt(0).toLowerCase() + sinPuntoFinal.slice(1)
}

export function numeroCompleto(acuerdo, juntaNumero) {
  if (!acuerdo?.consecutivo) return null
  return `${acuerdo.consecutivo}.${juntaNumero}.${acuerdo.anio}`
}
