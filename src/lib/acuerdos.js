import { supabase } from './supabaseClient'

// Asigna consecutivo global a los acuerdos de una junta que aún no lo tienen (y no están retirados)
export async function asignarConsecutivos(juntaId, anio) {
  const { data: acuerdos } = await supabase
    .from('jg_acuerdos')
    .select('*')
    .eq('junta_id', juntaId)
    .order('orden')

  const { data: maxRow } = await supabase
    .from('jg_acuerdos')
    .select('consecutivo')
    .not('consecutivo', 'is', null)
    .order('consecutivo', { ascending: false })
    .limit(1)

  let siguiente = (maxRow && maxRow[0] ? maxRow[0].consecutivo : 0) + 1

  for (const a of acuerdos || []) {
    if (!a.retirado && !a.consecutivo) {
      await supabase.from('jg_acuerdos').update({ consecutivo: siguiente, anio }).eq('id', a.id)
      siguiente++
    }
  }
}

export const PUNTOS_DEFAULT = [
  { numero: 1, texto: 'Bienvenida a cargo de la Representante de la Presidenta del Consejo de Administración.' },
  { numero: 2, texto: 'Pase de lista a cargo del Director General del Instituto y Secretario Técnico del Consejo de Administración.' },
  { numero: 3, texto: 'Instalación Legal de la Asamblea.' },
  { numero: 4, texto: 'Lectura del acta anterior.' },
  { numero: 6, texto: 'Asuntos generales.' },
  { numero: 7, texto: 'Clausura a cargo de la Representante de la Presidenta del Consejo de Administración.' },
]
