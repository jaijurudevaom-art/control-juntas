import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { fechaLarga } from '../lib/formatFecha'

export default function Juntas() {
  const [juntas, setJuntas] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase
      .from('jg_juntas')
      .select('*')
      .order('numero', { ascending: false })
      .then(({ data }) => {
        setJuntas(data || [])
        setLoading(false)
      })
  }, [])

  async function crearJunta() {
    // sugiere el siguiente número consecutivo
    const { data } = await supabase.from('jg_juntas').select('numero').order('numero', { ascending: false }).limit(1)
    const siguiente = data && data[0] ? data[0].numero + 1 : 1
    const anio = new Date().getFullYear()
    const { data: nueva, error } = await supabase
      .from('jg_juntas')
      .insert({ numero: siguiente, anio, tipo: 'ordinaria', fecha: new Date().toISOString().slice(0, 10) })
      .select()
      .single()
    if (!error) navigate(`/juntas/${nueva.id}`)
  }

  return (
    <div>
      <div className="top-actions">
        <h2>Juntas del Consejo de Administración</h2>
        <button className="btn" onClick={crearJunta}>+ Dar de alta nueva junta</button>
      </div>

      <div className="card">
        {loading ? (
          <p className="muted">Cargando…</p>
        ) : juntas.length === 0 ? (
          <p className="empty">Aún no has dado de alta ninguna junta.</p>
        ) : (
          <table>
            <thead>
              <tr><th>No.</th><th>Tipo</th><th>Fecha</th><th>Estatus</th><th></th></tr>
            </thead>
            <tbody>
              {juntas.map((j) => (
                <tr key={j.id}>
                  <td><strong>{j.numero}</strong></td>
                  <td><span className={`badge ${j.tipo}`}>{j.tipo}</span></td>
                  <td>{fechaLarga(j.fecha)}</td>
                  <td><span className={`badge ${j.estatus}`}>{j.estatus}</span></td>
                  <td><Link className="link-btn" to={`/juntas/${j.id}`}>Abrir</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
