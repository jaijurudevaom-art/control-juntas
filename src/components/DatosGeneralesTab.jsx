import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function DatosGeneralesTab({ junta, onChange }) {
  const [form, setForm] = useState(junta)
  const [guardando, setGuardando] = useState(false)

  function set(field, value) {
    setForm({ ...form, [field]: value })
  }

  async function guardar(e) {
    e.preventDefault()
    setGuardando(true)
    await supabase
      .from('jg_juntas')
      .update({
        numero: form.numero,
        anio: form.anio,
        tipo: form.tipo,
        fecha: form.fecha,
        hora: form.hora,
        lugar: form.lugar,
        estatus: form.estatus,
        hora_instalacion: form.hora_instalacion || null,
        hora_clausura: form.hora_clausura || null,
        acta_anterior_omitida: form.acta_anterior_omitida,
        asuntos_generales: form.asuntos_generales,
        notas: form.notas,
      })
      .eq('id', junta.id)
    setGuardando(false)
    onChange()
  }

  return (
    <form className="card" onSubmit={guardar}>
      <div className="row">
        <div className="field">
          <label>Número de junta (consecutivo)</label>
          <input type="number" value={form.numero} onChange={(e) => set('numero', Number(e.target.value))} required />
        </div>
        <div className="field">
          <label>Tipo</label>
          <select value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
            <option value="ordinaria">Ordinaria</option>
            <option value="extraordinaria">Extraordinaria</option>
          </select>
        </div>
        <div className="field">
          <label>Año (para numeración de acuerdos)</label>
          <input type="number" value={form.anio} onChange={(e) => set('anio', Number(e.target.value))} required />
        </div>
      </div>

      <div className="row">
        <div className="field">
          <label>Fecha</label>
          <input type="date" value={form.fecha} onChange={(e) => set('fecha', e.target.value)} required />
        </div>
        <div className="field">
          <label>Hora de inicio</label>
          <input type="time" value={form.hora?.slice(0, 5) || ''} onChange={(e) => set('hora', e.target.value)} required />
        </div>
        <div className="field">
          <label>Estatus</label>
          <select value={form.estatus} onChange={(e) => set('estatus', e.target.value)}>
            <option value="borrador">Borrador</option>
            <option value="convocada">Convocada</option>
            <option value="celebrada">Celebrada</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label>Lugar</label>
        <input value={form.lugar} onChange={(e) => set('lugar', e.target.value)} required />
      </div>

      <div className="row">
        <div className="field">
          <label>Hora de instalación legal (opcional, para el acta)</label>
          <input type="time" value={form.hora_instalacion?.slice(0, 5) || ''} onChange={(e) => set('hora_instalacion', e.target.value)} />
        </div>
        <div className="field">
          <label>Hora de clausura (opcional, para el acta)</label>
          <input type="time" value={form.hora_clausura?.slice(0, 5) || ''} onChange={(e) => set('hora_clausura', e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Asuntos generales (texto libre para el acta)</label>
        <textarea rows={3} value={form.asuntos_generales || ''} onChange={(e) => set('asuntos_generales', e.target.value)} />
      </div>

      <div className="field">
        <label>Notas internas (no se imprimen)</label>
        <textarea rows={2} value={form.notas || ''} onChange={(e) => set('notas', e.target.value)} />
      </div>

      <button className="btn" type="submit" disabled={guardando}>
        {guardando ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  )
}
