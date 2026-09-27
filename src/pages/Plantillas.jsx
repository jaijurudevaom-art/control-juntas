import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Fila({ plantilla, onChange }) {
  const [texto, setTexto] = useState(plantilla.texto)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  async function guardar() {
    setGuardando(true)
    await supabase.from('jg_plantillas_desarrollo').update({ texto, updated_at: new Date().toISOString() }).eq('id', plantilla.id)
    setGuardando(false)
    setEditando(false)
    onChange()
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{plantilla.punto_numero}. {plantilla.etiqueta}</h3>
      {editando ? (
        <div>
          <textarea rows={4} value={texto} onChange={(e) => setTexto(e.target.value)} />
          <div style={{ marginTop: 8 }}>
            <button className="btn" onClick={guardar} disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>{' '}
            <button className="btn secondary" onClick={() => { setTexto(plantilla.texto); setEditando(false) }}>Cancelar</button>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ whiteSpace: 'pre-wrap' }}>{plantilla.texto}</p>
          <button className="link-btn" onClick={() => setEditando(true)}>Editar</button>
        </div>
      )}
    </div>
  )
}

export default function Plantillas() {
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)

  async function cargar() {
    setLoading(true)
    const { data } = await supabase.from('jg_plantillas_desarrollo').select('*').order('punto_numero')
    setLista(data || [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  return (
    <div>
      <h2>Plantillas de desarrollo</h2>
      <p className="muted">
        Estos son los textos base que se sugieren para el "desarrollo" de los puntos fijos de la agenda (bienvenida,
        pase de lista, instalación legal, lectura del acta anterior, asuntos generales y clausura). Al capturar una
        junta nueva y abrir "Agregar desarrollo" en uno de estos puntos, aparece este texto ya listo para editar o
        borrar antes de guardar — no se aplica solo, tú decides si lo usas tal cual, lo ajustas o lo quitas.
      </p>
      <p className="muted">
        Puedes usar estos marcadores dentro del texto y se sustituyen automáticamente con los datos de la junta que
        estés capturando: <code>{'{{tipo}}'}</code> (Ordinaria/Extraordinaria), <code>{'{{tipo_min}}'}</code> (ordinaria/extraordinaria),{' '}
        <code>{'{{fecha}}'}</code> (ej. "miércoles 26 de agosto de 2026"), <code>{'{{hora_instalacion}}'}</code> y{' '}
        <code>{'{{hora_clausura}}'}</code>.
      </p>
      {loading ? (
        <p className="muted">Cargando…</p>
      ) : (
        lista.map((p) => <Fila key={p.id} plantilla={p} onChange={cargar} />)
      )}
    </div>
  )
}
