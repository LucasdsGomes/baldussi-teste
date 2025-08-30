import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginHome from './components/LoginHome.tsx'
import Register from './components/Register.tsx'
import Dashboard from './components/Dashboard.tsx'
import DashboardUsers from './components/DashboardUsers.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginHome />} />
        <Route path="/dashboard-users" element={<DashboardUsers />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
