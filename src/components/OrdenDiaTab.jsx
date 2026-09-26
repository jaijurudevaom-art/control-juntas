import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { asignarConsecutivos } from '../lib/acuerdos'
import { numeroCompleto } from '../lib/formatFecha'

function PuntoFijo({ punto, onChange }) {
  const [desarrollo, setDesarrollo] = useState(punto.desarrollo || '')
  const [editando, setEditando] = useState(false)

  async function guardar() {
    await supabase.from('jg_orden_dia_puntos').update({ desarrollo }).eq('id', punto.id)
    setEditando(false)
    onChange()
  }

  return (
    <div className="acuerdo-item" style={{ borderLeftColor: '#999' }}>
      <strong>{punto.numero}. {punto.texto}</strong>
      {editando ? (
        <div style={{ marginTop: 8 }}>
          <textarea
            rows={2}
            placeholder="Qué se expuso/acordó en este punto (para el desarrollo del acta)…"
            value={desarrollo}
            onChange={(e) => setDesarrollo(e.target.value)}
          />
          <div style={{ marginTop: 6 }}>
            <button className="btn" onClick={guardar}>Guardar</button>{' '}
            <button className="btn secondary" onClick={() => setEditando(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 6 }}>
          {punto.desarrollo ? <p className="muted" style={{ margin: '4px 0' }}>{punto.desarrollo}</p> : null}
          <button className="link-btn" onClick={() => setEditando(true)}>
            {punto.desarrollo ? 'Editar desarrollo' : '+ Agregar desarrollo para el acta'}
          </button>
        </div>
      )}
    </div>
  )
}

function AcuerdoItem({ acuerdo, juntaNumero, onChange }) {
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState(acuerdo)

  async function guardar() {
    await supabase
      .from('jg_acuerdos')
      .update({ numero_tema: form.numero_tema, titulo: form.titulo, desarrollo: form.desarrollo, anexo_num: form.anexo_num || null })
      .eq('id', acuerdo.id)
    setEditando(false)
    onChange()
  }

  async function toggleRetirado() {
    const retirado = !acuerdo.retirado
    await supabase
      .from('jg_acuerdos')
      .update({ retirado, motivo_retiro: retirado ? acuerdo.motivo_retiro || 'Se retira del presente Orden del Día.' : null, consecutivo: retirado ? null : acuerdo.consecutivo })
      .eq('id', acuerdo.id)
    onChange()
  }

  async function eliminar() {
    if (!confirm('¿Eliminar este acuerdo?')) return
    await supabase.from('jg_acuerdos').delete().eq('id', acuerdo.id)
    onChange()
  }

  const numCompleto = numeroCompleto(acuerdo, juntaNumero)

  return (
    <div className={`acuerdo-item ${acuerdo.retirado ? 'retirado' : ''}`}>
      {editando ? (
        <div>
          <div className="row">
            <div className="field">
              <label>Número de tema (ej. 5.1)</label>
              <input value={form.numero_tema} onChange={(e) => setForm({ ...form, numero_tema: e.target.value })} />
            </div>
            <div className="field">
              <label>Número de anexo (opcional)</label>
              <input type="number" value={form.anexo_num || ''} onChange={(e) => setForm({ ...form, anexo_num: e.target.value ? Number(e.target.value) : null })} />
            </div>
          </div>
          <div className="field">
            <label>Título / tema</label>
            <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          </div>
          <div className="field">
            <label>Desarrollo (texto para el acta)</label>
            <textarea rows={4} value={form.desarrollo || ''} onChange={(e) => setForm({ ...form, desarrollo: e.target.value })} />
          </div>
          <button className="btn" onClick={guardar}>Guardar</button>{' '}
          <button className="btn secondary" onClick={() => setEditando(false)}>Cancelar</button>
        </div>
      ) : (
        <div>
          <span className="num">{acuerdo.numero_tema}</span>
          {acuerdo.titulo}
          {numCompleto && <span className="muted"> — Acuerdo No. {numCompleto}</span>}
          {acuerdo.retirado && <span className="muted"> (retirado)</span>}
          <div style={{ marginTop: 8 }}>
            <button className="link-btn" onClick={() => setEditando(true)}>Editar</button>{' '}
            <button className="link-btn" onClick={toggleRetirado}>{acuerdo.retirado ? 'Reactivar' : 'Marcar como retirado'}</button>{' '}
            <button className="link-btn" onClick={eliminar}>Eliminar</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrdenDiaTab({ junta, puntos, acuerdos, onChange }) {
  const [nuevo, setNuevo] = useState({ numero_tema: '', titulo: '' })

  const puntosAntes = puntos.filter((p) => p.numero < 5)
  const puntosDespues = puntos.filter((p) => p.numero > 5)

  async function agregarAcuerdo(e) {
    e.preventDefault()
    if (!nuevo.titulo.trim()) return
    const numeroTema = nuevo.numero_tema.trim() || `5.${acuerdos.length + 1}`
    await supabase.from('jg_acuerdos').insert({
      junta_id: junta.id,
      numero_tema: numeroTema,
      titulo: nuevo.titulo,
      orden: acuerdos.length,
    })
    setNuevo({ numero_tema: '', titulo: '' })
    onChange()
  }

  async function asignarNumeros() {
    await asignarConsecutivos(junta.id, junta.anio)
    onChange()
  }

  return (
    <div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Agenda fija</h3>
        {puntosAntes.map((p) => <PuntoFijo key={p.id} punto={p} onChange={onChange} />)}
      </div>

      <div className="card">
        <div className="top-actions">
          <h3 style={{ margin: 0 }}>Punto 5 — Acuerdos</h3>
          <button className="btn secondary" onClick={asignarNumeros}>Asignar números de acuerdo</button>
        </div>
        <p className="muted" style={{ marginTop: -6 }}>
          Los acuerdos sin retirar reciben su número consecutivo (independiente de la junta) al presionar "Asignar números", o automáticamente al generar el acta.
        </p>
        {acuerdos.length === 0 ? (
          <p className="empty">Aún no hay acuerdos capturados.</p>
        ) : (
          acuerdos.map((a) => <AcuerdoItem key={a.id} acuerdo={a} juntaNumero={junta.numero} onChange={onChange} />)
        )}

        <form onSubmit={agregarAcuerdo} style={{ marginTop: 14, borderTop: '1px solid #e4e8e6', paddingTop: 14 }}>
          <div className="row">
            <div className="field" style={{ flex: '0 0 100px' }}>
              <label>No. tema</label>
              <input placeholder={`5.${acuerdos.length + 1}`} value={nuevo.numero_tema} onChange={(e) => setNuevo({ ...nuevo, numero_tema: e.target.value })} />
            </div>
            <div className="field">
              <label>Título del acuerdo</label>
              <input value={nuevo.titulo} onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })} placeholder="Ej. Informe de actividades del tercer trimestre de 2026" />
            </div>
          </div>
          <button className="btn" type="submit">+ Agregar acuerdo</button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Cierre de agenda</h3>
        {puntosDespues.map((p) => <PuntoFijo key={p.id} punto={p} onChange={onChange} />)}
      </div>
    </div>
  )
}
