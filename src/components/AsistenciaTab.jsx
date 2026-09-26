import { supabase } from '../lib/supabaseClient'

export default function AsistenciaTab({ juntaId, integrantes, asistenciaIds, onChange }) {
  async function toggle(integranteId) {
    const presente = asistenciaIds.includes(integranteId)
    if (presente) {
      await supabase.from('jg_asistencia').delete().eq('junta_id', juntaId).eq('integrante_id', integranteId)
    } else {
      await supabase.from('jg_asistencia').insert({ junta_id: juntaId, integrante_id: integranteId })
    }
    onChange()
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Lista de asistencia</h3>
      <p className="muted" style={{ marginTop: -6 }}>Marca quiénes asistieron a esta junta.</p>
      <table>
        <thead><tr><th></th><th>Nombre</th><th>Representación</th></tr></thead>
        <tbody>
          {integrantes.map((i) => (
            <tr key={i.id}>
              <td>
                <input type="checkbox" checked={asistenciaIds.includes(i.id)} onChange={() => toggle(i.id)} style={{ width: 18 }} />
              </td>
              <td>{i.nombre}</td>
              <td className="muted">{i.representacion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
