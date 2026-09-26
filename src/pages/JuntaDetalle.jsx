import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { PUNTOS_DEFAULT } from '../lib/acuerdos'
import DatosGeneralesTab from '../components/DatosGeneralesTab'
import OrdenDiaTab from '../components/OrdenDiaTab'
import AsistenciaTab from '../components/AsistenciaTab'
import DocumentosTab from '../components/DocumentosTab'

const TABS = [
  { key: 'datos', label: 'Datos generales' },
  { key: 'orden', label: 'Orden del día y acuerdos' },
  { key: 'asistencia', label: 'Asistencia' },
  { key: 'documentos', label: 'Documentos' },
]

export default function JuntaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [junta, setJunta] = useState(null)
  const [integrantes, setIntegrantes] = useState([])
  const [puntos, setPuntos] = useState([])
  const [acuerdos, setAcuerdos] = useState([])
  const [asistenciaIds, setAsistenciaIds] = useState([])
  const [documentos, setDocumentos] = useState([])
  const [tab, setTab] = useState('datos')
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    const [{ data: j }, { data: ints }, { data: pts }, { data: acs }, { data: asis }, { data: docs }] = await Promise.all([
      supabase.from('jg_juntas').select('*').eq('id', id).single(),
      supabase.from('jg_integrantes').select('*').eq('activo', true).order('orden'),
      supabase.from('jg_orden_dia_puntos').select('*').eq('junta_id', id).order('numero'),
      supabase.from('jg_acuerdos').select('*').eq('junta_id', id).order('orden'),
      supabase.from('jg_asistencia').select('integrante_id').eq('junta_id', id),
      supabase.from('jg_documentos').select('*').eq('junta_id', id).order('generado_en', { ascending: false }),
    ])
    setJunta(j)
    setIntegrantes(ints || [])
    setAcuerdos(acs || [])
    setAsistenciaIds((asis || []).map((a) => a.integrante_id))
    setDocumentos(docs || [])

    if (!pts || pts.length === 0) {
      const inserts = PUNTOS_DEFAULT.map((p) => ({ ...p, junta_id: id }))
      const { data: creados } = await supabase.from('jg_orden_dia_puntos').insert(inserts).select()
      setPuntos((creados || []).sort((a, b) => a.numero - b.numero))
    } else {
      setPuntos(pts)
    }
    setLoading(false)
  }, [id])

  useEffect(() => { cargar() }, [cargar])

  if (loading) return <p className="muted">Cargando junta…</p>
  if (!junta) return <p>No se encontró esta junta.</p>

  return (
    <div>
      <div className="top-actions">
        <div>
          <h2 style={{ marginBottom: 4 }}>
            Junta {junta.tipo === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria'} No. {junta.numero}
          </h2>
          <span className={`badge ${junta.estatus}`}>{junta.estatus}</span>
        </div>
        <button className="btn secondary" onClick={() => navigate('/juntas')}>← Volver a juntas</button>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'datos' && <DatosGeneralesTab junta={junta} onChange={cargar} />}
      {tab === 'orden' && <OrdenDiaTab junta={junta} puntos={puntos} acuerdos={acuerdos} onChange={cargar} />}
      {tab === 'asistencia' && (
        <AsistenciaTab juntaId={junta.id} integrantes={integrantes} asistenciaIds={asistenciaIds} onChange={cargar} />
      )}
      {tab === 'documentos' && (
        <DocumentosTab
          junta={junta}
          integrantes={integrantes}
          puntos={puntos}
          acuerdos={acuerdos}
          asistenciaIds={asistenciaIds}
          documentos={documentos}
          onChange={cargar}
        />
      )}
    </div>
  )
}
