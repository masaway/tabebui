import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import TopPage from './pages/TopPage'
import PartsPage from './pages/PartsPage'
import RecordPage from './pages/RecordPage'
import ConciergePage from './pages/ConciergePage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <PrivateRoute>
                <TopPage />
              </PrivateRoute>
            } />
            <Route path="/parts" element={
              <PrivateRoute>
                <PartsPage />
              </PrivateRoute>
            } />
            <Route path="/record" element={
              <PrivateRoute>
                <RecordPage />
              </PrivateRoute>
            } />
            <Route path="/concierge" element={
              <PrivateRoute>
                <ConciergePage />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

