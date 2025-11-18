import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Login from './components/Login'
import Register from './components/Register'
import CreateReport from './components/CreateReport'
import ReportDetail from './components/ReportDetail'
import MyReports from './components/MyReports'
import EditReport from './components/EditReport'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode> 
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/crear-reporte" element={<CreateReport />} />
          <Route path="/reporte/:id" element={<ReportDetail />} />
          <Route path="/mis-reportes" element={<MyReports />} />
          <Route path="/editar-reporte/:id" element={<EditReport />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
