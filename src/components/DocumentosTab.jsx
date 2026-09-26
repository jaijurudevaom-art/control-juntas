import { useState } from 'react'
import { saveAs } from 'file-saver'
import { supabase, BUCKET } from '../lib/supabaseClient'
import { asignarConsecutivos } from '../lib/acuerdos'
import { generarOrdenDelDia } from '../lib/docx/ordenDelDia'
import { generarListaAsistencia } from '../lib/docx/listaAsistencia'
import { generarConvocatoria } from '../lib/docx/convocatoria'
import { generarActa } from '../lib/docx/acta'
import { generarFichaTecnica } from '../lib/docx/fichaTecnica'

const TIPO_LABEL = {
  convocatoria: 'Convocatoria',
  orden_dia: 'Orden del día',
  lista_asistencia: 'Lista de asistencia',
  acta: 'Acta',
  ficha_tecnica: 'Ficha técnica',
}

async function subirYRegistrar({ juntaId, acuerdoId = null, integranteId = null, tipo, blob, nombreArchivo }) {
  const path = `juntas/${juntaId}/${tipo}/${Date.now()}-${nombreArchivo}`
  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  if (upErr) throw upErr
  await supabase.from('jg_documentos').insert({
    junta_id: juntaId,
    acuerdo_id: acuerdoId,
    integrante_id: integranteId,
    tipo,
    storage_path: path,
    nombre_archivo: nombreArchivo,
  })
}

export default function DocumentosTab({ junta, integrantes, puntos, acuerdos, asistenciaIds, documentos, onChange }) {
  const [generando, setGenerando] = useState('')
  const [mostrarConvocatoria, setMostrarConvocatoria] = useState(false)

  const asistentes = integrantes.filter((i) => asistenciaIds.includes(i.id))

  async function conFeedback(tipo, fn) {
    setGenerando(tipo)
    try {
      await fn()
      onChange()
    } catch (err) {
      alert('Ocurrió un error generando el documento: ' + err.message)
    } finally {
      setGenerando('')
    }
  }

  async function hacerOrdenDia() {
    await conFeedback('orden_dia', async () => {
      const blob = await generarOrdenDelDia({ junta, puntos, acuerdos })
      const nombre = `Orden_del_dia_Acta_${junta.numero}.docx`
      saveAs(blob, nombre)
      await subirYRegistrar({ juntaId: junta.id, tipo: 'orden_dia', blob, nombreArchivo: nombre })
    })
  }

  async function hacerListaAsistencia() {
    await conFeedback('lista_asistencia', async () => {
      const blob = await generarListaAsistencia({ junta, asistentes })
      const nombre = `Lista_de_Asistencia_Acta_${junta.numero}.docx`
      saveAs(blob, nombre)
      await subirYRegistrar({ juntaId: junta.id, tipo: 'lista_asistencia', blob, nombreArchivo: nombre })
    })
  }

  async function hacerActa() {
    await conFeedback('acta', async () => {
      await asignarConsecutivos(junta.id, junta.anio)
      const { data: acuerdosActualizados } = await supabase.from('jg_acuerdos').select('*').eq('junta_id', junta.id).order('orden')
      const blob = await generarActa({ junta, asistentes, puntos, acuerdos: acuerdosActualizados })
      const nombre = `Acta_${junta.numero}.docx`
      saveAs(blob, nombre)
      await subirYRegistrar({ juntaId: junta.id, tipo: 'acta', blob, nombreArchivo: nombre })
    })
  }

  async function hacerFichaTecnica(acuerdo) {
    await conFeedback('ficha_' + acuerdo.id, async () => {
      await asignarConsecutivos(junta.id, junta.anio)
      const { data: fresco } = await supabase.from('jg_acuerdos').select('*').eq('id', acuerdo.id).single()
      const blob = await generarFichaTecnica({ junta, acuerdo: fresco })
      const nombre = `Ficha_Tecnica_${fresco.numero_tema}_Acta_${junta.numero}.docx`
      saveAs(blob, nombre)
      await subirYRegistrar({ juntaId: junta.id, acuerdoId: acuerdo.id, tipo: 'ficha_tecnica', blob, nombreArchivo: nombre })
    })
  }

  async function descargarExistente(doc) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.storage_path, 300)
    if (error) { alert('No se pudo generar el enlace: ' + error.message); return }
    window.open(data.signedUrl, '_blank')
  }

  const acuerdosNoRetirados = acuerdos.filter((a) => !a.retirado)

  return (
    <div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Preparación de la junta</h3>
        <p className="muted" style={{ marginTop: -6 }}>Genera y descarga los documentos con el formato institucional. Cada uno queda guardado abajo para consultarlo después.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => setMostrarConvocatoria(true)}>Generar convocatoria</button>
          <button className="btn secondary" onClick={hacerOrdenDia} disabled={generando === 'orden_dia'}>
            {generando === 'orden_dia' ? 'Generando…' : 'Generar orden del día'}
          </button>
          <button className="btn secondary" onClick={hacerListaAsistencia} disabled={generando === 'lista_asistencia'}>
            {generando === 'lista_asistencia' ? 'Generando…' : 'Generar lista de asistencia'}
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Después de la junta</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" onClick={hacerActa} disabled={generando === 'acta'}>
            {generando === 'acta' ? 'Generando…' : 'Generar acta'}
          </button>
        </div>
        <p className="muted" style={{ marginTop: 10 }}>Fichas técnicas por acuerdo:</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {acuerdosNoRetirados.length === 0 && <span className="muted">No hay acuerdos capturados todavía.</span>}
          {acuerdosNoRetirados.map((a) => (
            <button key={a.id} className="btn secondary" onClick={() => hacerFichaTecnica(a)} disabled={generando === 'ficha_' + a.id}>
              {generando === 'ficha_' + a.id ? 'Generando…' : `Ficha ${a.numero_tema}`}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Documentos generados</h3>
        {documentos.length === 0 ? (
          <p className="empty">Todavía no se ha generado ningún documento para esta junta.</p>
        ) : (
          <table>
            <thead><tr><th>Tipo</th><th>Archivo</th><th>Generado</th><th></th></tr></thead>
            <tbody>
              {documentos.map((d) => (
                <tr key={d.id}>
                  <td>{TIPO_LABEL[d.tipo]}</td>
                  <td className="muted">{d.nombre_archivo}</td>
                  <td className="muted">{new Date(d.generado_en).toLocaleString('es-MX')}</td>
                  <td><button className="link-btn" onClick={() => descargarExistente(d)}>Descargar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {mostrarConvocatoria && (
        <ConvocatoriaModal
          junta={junta}
          integrantes={integrantes}
          puntos={puntos}
          acuerdos={acuerdos}
          onClose={() => setMostrarConvocatoria(false)}
          onGenerado={() => { setMostrarConvocatoria(false); onChange() }}
        />
      )}
    </div>
  )
}

function ConvocatoriaModal({ junta, integrantes, puntos, acuerdos, onClose, onGenerado }) {
  const presidentaDefault = integrantes.find((i) => (i.representacion || '').toLowerCase().includes('presidenta')) || integrantes[0]
  const [presidentaId, setPresidentaId] = useState(presidentaDefault?.id || '')
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().slice(0, 10))
  const [seleccion, setSeleccion] = useState(
    Object.fromEntries(integrantes.filter((i) => i.id !== presidentaDefault?.id).map((i, idx) => [i.id, true]))
  )
  const [oficios, setOficios] = useState(
    Object.fromEntries(integrantes.map((i, idx) => [i.id, String(idx + 1).padStart(4, '0')]))
  )
  const [generando, setGenerando] = useState(false)

  const destinatarios = integrantes.filter((i) => seleccion[i.id] && i.id !== presidentaId)

  async function generar() {
    setGenerando(true)
    try {
      const presidenta = integrantes.find((i) => i.id === presidentaId)
      const destinatariosPayload = destinatarios.map((i) => ({
        integrante: i,
        numero_oficio: oficios[i.id] || '',
        fecha_oficio: fechaEmision,
      }))
      const blob = await generarConvocatoria({
        junta,
        destinatarios: destinatariosPayload,
        puntos,
        acuerdos,
        presidenta: { nombre: presidenta.nombre, cargo: [presidenta.cargo, presidenta.representacion].filter(Boolean).join(' y ') },
        fechaEmision,
      })
      const nombre = `Convocatoria_${junta.tipo === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria'}_${junta.numero}.docx`
      saveAs(blob, nombre)
      const path = `juntas/${junta.id}/convocatoria/${Date.now()}-${nombre}`
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, {
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      if (upErr) throw upErr
      await supabase.from('jg_documentos').insert({ junta_id: junta.id, tipo: 'convocatoria', storage_path: path, nombre_archivo: nombre })

      for (const d of destinatariosPayload) {
        await supabase.from('jg_oficios_convocatoria').upsert(
          { junta_id: junta.id, integrante_id: d.integrante.id, numero_oficio: d.numero_oficio, fecha_oficio: d.fecha_oficio },
          { onConflict: 'junta_id,integrante_id' }
        )
      }
      await supabase.from('jg_juntas').update({ estatus: 'convocada' }).eq('id', junta.id)
      onGenerado()
    } catch (err) {
      alert('Error al generar la convocatoria: ' + err.message)
    } finally {
      setGenerando(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,30,25,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
      <div className="card" style={{ width: 640, maxHeight: '85vh', overflowY: 'auto' }}>
        <h3 style={{ marginTop: 0 }}>Generar convocatoria</h3>
        <div className="row">
          <div className="field">
            <label>Firma (Presidenta/quien convoca)</label>
            <select value={presidentaId} onChange={(e) => setPresidentaId(e.target.value)}>
              {integrantes.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Fecha de emisión del oficio</label>
            <input type="date" value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} />
          </div>
        </div>

        <label>Destinatarios y número de oficio</label>
        <table>
          <tbody>
            {integrantes.filter((i) => i.id !== presidentaId).map((i) => (
              <tr key={i.id}>
                <td style={{ width: 24 }}>
                  <input type="checkbox" checked={!!seleccion[i.id]} onChange={(e) => setSeleccion({ ...seleccion, [i.id]: e.target.checked })} />
                </td>
                <td>{i.nombre}</td>
                <td style={{ width: 110 }}>
                  <input value={oficios[i.id] || ''} onChange={(e) => setOficios({ ...oficios, [i.id]: e.target.value })} placeholder="0145" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 16 }}>
          <button className="btn" onClick={generar} disabled={generando}>{generando ? 'Generando…' : `Generar ${destinatarios.length} oficios`}</button>{' '}
          <button className="btn secondary" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  )
}
