/**
 * App.jsx — Root component with simple auth-based routing
 *
 * No router library needed: the app has exactly two states:
 *   - Not authenticated → show LoginPage
 *   - Authenticated     → show ChatPage
 */
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ChatPage  from './pages/ChatPage.jsx'

function AppRoutes() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <ChatPage /> : <LoginPage />
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
