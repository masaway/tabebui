import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import TopPage from './pages/TopPage'
import PartsPage from './pages/PartsPage'
import RecordPage from './pages/RecordPage'
import ConciergePage from './pages/ConciergePage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <Routes>
          <Route path="/" element={<TopPage />} />
          <Route path="/parts" element={<PartsPage />} />
          <Route path="/record" element={<RecordPage />} />
          <Route path="/concierge" element={<ConciergePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  )
}

