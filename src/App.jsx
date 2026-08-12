import React, { createContext, useContext, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Phone from './pages/Phone'
import SetupVoiceAgent from './pages/SetupVoiceAgent'
import Pricing from './pages/Pricing'
import InboxSetup from './pages/InboxSetup'
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

function ProtectedRoute({ children, requiresSetup = true }) {
  const { session, customer, loading } = useContext(AppContext)
  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ background: '#0D0D12' }}>
      <div style={{ color: '#666680', fontSize: 14 }}>Loading...</div>
    </div>
  )
  if (!session) return <Navigate to="/login" replace />
  // No active plan → go pay first
  if (requiresSetup && customer && customer.plan_status !== 'active') return <Navigate to="/pricing" replace />
  // Paid but no number yet → go set up
  if (requiresSetup && customer && customer.plan_status === 'active' && !customer.twilio_number) return <Navigate to="/setup" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  const [session, setSession] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Persist affiliate ref code from URL into localStorage
    const urlRef = new URLSearchParams(window.location.search).get('ref')
    if (urlRef) localStorage.setItem('mh_ref', urlRef)

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
          <Route path="/pricing" element={<ProtectedRoute requiresSetup={false}><Pricing /></ProtectedRoute>} />
          <Route path="/setup" element={<ProtectedRoute requiresSetup={false}><SetupVoiceAgent /></ProtectedRoute>} />
          <Route path="/inbox/setup" element={<ProtectedRoute><InboxSetup /></ProtectedRoute>} />
          <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
          <Route path="/phone" element={<ProtectedRoute><Phone /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  )
}
