import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { numeroCompleto, fechaLarga } from '../lib/formatFecha'

export default function Buscador() {
  const [q, setQ] = useState('')
  const [resultados, setResultados] = useState(null)
  const [buscando, setBuscando] = useState(false)

  async function buscar(e) {
    e.preventDefault()
    setBuscando(true)
    const query = q.trim()

    let acuerdosQuery = supabase
      .from('jg_acuerdos')
      .select('*, jg_juntas(id, numero, tipo, fecha)')
      .order('created_at', { ascending: false })

    if (query) {
      // busca por número completo "119.64.2026", por consecutivo, o por texto en título/desarrollo
      const numMatch = query.match(/^(\d+)/)
      acuerdosQuery = acuerdosQuery.or(
        `titulo.ilike.%${query}%,desarrollo.ilike.%${query}%,numero_tema.ilike.%${query}%${numMatch ? `,consecutivo.eq.${numMatch[1]}` : ''}`
      )
    }

    const { data, error } = await acuerdosQuery.limit(50)
    setResultados(error ? [] : data)
    setBuscando(false)
  }

  return (
    <div>
      <h2>Buscar acuerdos</h2>
      <form className="card" onSubmit={buscar}>
        <div className="field">
          <label>Palabra clave, tema, o número de acuerdo (ej. "presupuesto", "119.64.2026")</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" />
        </div>
        <button className="btn" type="submit" disabled={buscando}>{buscando ? 'Buscando…' : 'Buscar'}</button>
      </form>

      {resultados && (
        <div className="card">
          {resultados.length === 0 ? (
            <p className="empty">No se encontraron acuerdos con ese criterio.</p>
          ) : (
            resultados.map((a) => (
              <div className="search-hit" key={a.id}>
                <div>
                  <span className="num-completo">
                    {a.consecutivo ? `Acuerdo ${numeroCompleto(a, a.jg_juntas?.numero)}` : `Tema ${a.numero_tema} (sin numerar)`}
                  </span>
                  {a.retirado && <span className="muted"> — retirado</span>}
                </div>
                <div>{a.titulo}</div>
                <div className="muted">
                  Junta {a.jg_juntas?.tipo === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria'} No. {a.jg_juntas?.numero} · {a.jg_juntas?.fecha ? fechaLarga(a.jg_juntas.fecha) : ''}
                  {' · '}
                  <Link className="link-btn" to={`/juntas/${a.jg_juntas?.id}`}>Ver junta</Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
