import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/shared/Navbar'

import Login         from './pages/Login'
import Register      from './pages/Register'
import Dashboard     from './pages/Dashboard'
import LogSymptoms   from './pages/LogSymptoms'
import History       from './pages/History'
import Settings      from './pages/Settings'
import Education     from './pages/Education'
import Remedies      from './pages/Remedies'
import Doctors       from './pages/Doctors'
import SymptomCheck  from './pages/SymptomCheck'
import CycleCalendar from './pages/CycleCalendar'
import AthleteHub    from './pages/AthleteHub'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="pt-12 md:pt-14 pb-20 md:pb-6 min-h-screen">
        {children}
      </main>
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  const privatePages = [
    ['/dashboard',     <Dashboard />],
    ['/log',           <LogSymptoms />],
    ['/history',       <History />],
    ['/settings',      <Settings />],
    ['/education',     <Education />],
    ['/remedies',      <Remedies />],
    ['/doctors',       <Doctors />],
    ['/symptom-check', <SymptomCheck />],
    ['/calendar',      <CycleCalendar />],
    ['/athlete',       <AthleteHub />],
  ]
  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to="/dashboard"/> : <Login/>}/>
      <Route path="/register" element={user ? <Navigate to="/dashboard"/> : <Register/>}/>
      {privatePages.map(([path, el]) => (
        <Route key={path} path={path}
          element={<PrivateRoute><Layout>{el}</Layout></PrivateRoute>}/>
      ))}
      <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center"
          toastOptions={{ className:'font-body text-sm', duration:3000 }}/>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
