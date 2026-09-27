import { diaSemana, fechaLarga } from './formatFecha'

// Quita segundos de un valor 'HH:MM:SS' -> 'HH:MM'
function soloHoraMin(hhmmss) {
  if (!hhmmss) return ''
  return hhmmss.slice(0, 5)
}

// Sustituye los placeholders {{...}} de una plantilla con los datos de la junta indicada.
export function renderPlantilla(texto, junta) {
  if (!texto || !junta) return texto || ''
  const tipo = junta.tipo === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria'
  const tipoMin = junta.tipo === 'ordinaria' ? 'ordinaria' : 'extraordinaria'
  const fecha = junta.fecha ? `${diaSemana(junta.fecha)} ${fechaLarga(junta.fecha)}` : ''

  return texto
    .replaceAll('{{tipo}}', tipo)
    .replaceAll('{{tipo_min}}', tipoMin)
    .replaceAll('{{fecha}}', fecha)
    .replaceAll('{{hora_instalacion}}', soloHoraMin(junta.hora_instalacion))
    .replaceAll('{{hora_clausura}}', soloHoraMin(junta.hora_clausura))
}
