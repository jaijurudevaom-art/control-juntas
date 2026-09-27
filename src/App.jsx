import { useEffect, useState } from 'react'
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import Login from './pages/Login'
import Juntas from './pages/Juntas'
import JuntaDetalle from './pages/JuntaDetalle'
import Integrantes from './pages/Integrantes'
import Buscador from './pages/Buscador'
import Plantillas from './pages/Plantillas'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (session === undefined) return null
  if (!session) return <Login />

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Control de Juntas<br /><small style={{ fontWeight: 400, opacity: 0.8 }}>Consejo de Administración</small></h1>
        <nav>
          <NavLink to="/juntas" className={({ isActive }) => (isActive ? 'active' : '')}>Juntas</NavLink>
          <NavLink to="/buscador" className={({ isActive }) => (isActive ? 'active' : '')}>Buscar acuerdos</NavLink>
          <NavLink to="/integrantes" className={({ isActive }) => (isActive ? 'active' : '')}>Integrantes</NavLink>
          <NavLink to="/plantillas" className={({ isActive }) => (isActive ? 'active' : '')}>Plantillas</NavLink>
        </nav>
        <button className="logout" onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
      </aside>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/juntas" replace />} />
          <Route path="/juntas" element={<Juntas />} />
          <Route path="/juntas/:id" element={<JuntaDetalle />} />
          <Route path="/buscador" element={<Buscador />} />
          <Route path="/integrantes" element={<Integrantes />} />
          <Route path="/plantillas" element={<Plantillas />} />
        </Routes>
      </main>
    </div>
  )
}
