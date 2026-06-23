import { Navigate, Route, Routes } from 'react-router-dom'
import { useAdminSession } from './features/admin/hooks/useAdminSession.tsx'
import { AdminDashboardPage } from './features/admin/pages/AdminDashboardPage.tsx'
import { AdminLoginPage } from './features/admin/pages/AdminLoginPage.tsx'
import { HomePage } from './features/publico/pages/HomePage.tsx'
import { PointDetailPage } from './features/publico/pages/PointDetailPage.tsx'
import { SearchPage } from './features/publico/pages/SearchPage.tsx'
import { SuggestPointPage } from './features/publico/pages/SuggestPointPage.tsx'

function RequireAdminAuth() {
  const { token } = useAdminSession()

  if (!token) {
    return <Navigate to="/admin/login" replace />
  }

  return <AdminDashboardPage />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pontos" element={<SearchPage />} />
      <Route path="/pontos/:id" element={<PointDetailPage />} />
      <Route path="/sugerir-ponto" element={<SuggestPointPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<RequireAdminAuth />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
