import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const empty = { nombre: '', cargo: '', representacion: '', notas: '' }

export default function Integrantes() {
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(null) // id o 'nuevo'
  const [form, setForm] = useState(empty)

  async function cargar() {
    setLoading(true)
    const { data } = await supabase.from('jg_integrantes').select('*').order('orden').order('nombre')
    setLista(data || [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  function abrirNuevo() {
    setForm(empty)
    setEditando('nuevo')
  }
  function abrirEditar(i) {
    setForm(i)
    setEditando(i.id)
  }

  async function guardar(e) {
    e.preventDefault()
    if (editando === 'nuevo') {
      await supabase.from('jg_integrantes').insert({
        nombre: form.nombre, cargo: form.cargo, representacion: form.representacion, notas: form.notas,
      })
    } else {
      await supabase.from('jg_integrantes').update({
        nombre: form.nombre, cargo: form.cargo, representacion: form.representacion, notas: form.notas,
      }).eq('id', editando)
    }
    setEditando(null)
    cargar()
  }

  async function toggleActivo(i) {
    await supabase.from('jg_integrantes').update({ activo: !i.activo }).eq('id', i.id)
    cargar()
  }

  return (
    <div>
      <div className="top-actions">
        <h2>Integrantes del Consejo</h2>
        <button className="btn" onClick={abrirNuevo}>+ Nuevo integrante</button>
      </div>

      {editando && (
        <form className="card" onSubmit={guardar}>
          <div className="field">
            <label>Nombre (con título, ej. "C.P. Nancy Alviso Martínez")</label>
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="field">
            <label>Cargo</label>
            <input value={form.cargo || ''} onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
          </div>
          <div className="field">
            <label>Representación (como aparece en convocatoria/acta)</label>
            <input value={form.representacion || ''} onChange={(e) => setForm({ ...form, representacion: e.target.value })} />
          </div>
          <div className="field">
            <label>Notas</label>
            <textarea rows={2} value={form.notas || ''} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
          </div>
          <button className="btn" type="submit">Guardar</button>{' '}
          <button className="btn secondary" type="button" onClick={() => setEditando(null)}>Cancelar</button>
        </form>
      )}

      <div className="card">
        {loading ? (
          <p className="muted">Cargando…</p>
        ) : lista.length === 0 ? (
          <p className="empty">Aún no hay integrantes registrados.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Nombre</th><th>Cargo</th><th>Representación</th><th></th><th></th></tr>
            </thead>
            <tbody>
              {lista.map((i) => (
                <tr key={i.id} style={{ opacity: i.activo ? 1 : 0.5 }}>
                  <td>{i.nombre}</td>
                  <td className="muted">{i.cargo}</td>
                  <td className="muted">{i.representacion}</td>
                  <td><button className="link-btn" onClick={() => abrirEditar(i)}>Editar</button></td>
                  <td><button className="link-btn" onClick={() => toggleActivo(i)}>{i.activo ? 'Desactivar' : 'Activar'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
