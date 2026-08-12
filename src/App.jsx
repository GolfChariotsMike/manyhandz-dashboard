import React, { createContext, useContext, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Phone from './pages/Phone'
import Inbox from './pages/Inbox'
import Sidebar from './components/Sidebar'

export const AppContext = createContext(null)

function Layout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0D0D12' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { session, loading } = useContext(AppContext)
  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ background: '#0D0D12' }}>
      <div className="text-muted text-sm">Loading...</div>
    </div>
  )
  if (!session) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  const [session, setSession] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadCustomer(session.user.email)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadCustomer(session.user.email)
      else { setCustomer(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadCustomer(email) {
    const { data } = await supabase
      .from('mh_customers')
      .select('*')
      .ilike('owner_email', email)
      .maybeSingle()
    setCustomer(data)
    setLoading(false)
  }

  return (
    <AppContext.Provider value={{ session, customer, loading, setCustomer }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/phone" element={<ProtectedRoute><Phone /></ProtectedRoute>} />
          <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  )
}
