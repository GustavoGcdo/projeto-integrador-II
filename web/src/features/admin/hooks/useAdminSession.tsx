import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import type { AdminUser } from '../../../types/models.ts'

const STORAGE_KEY = 'ecodescarte.admin.session'

interface SessionState {
  token: string | null
  user: AdminUser | null
  login: (token: string, user: AdminUser) => void
  logout: () => void
}

const AdminSessionContext = createContext<SessionState | undefined>(undefined)

export function AdminSessionProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return
    }

    try {
      const payload = JSON.parse(stored) as { token: string; user: AdminUser }
      setToken(payload.token)
      setUser(payload.user)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const value = useMemo<SessionState>(
    () => ({
      token,
      user,
      login: (nextToken, nextUser) => {
        setToken(nextToken)
        setUser(nextUser)
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ token: nextToken, user: nextUser }),
        )
      },
      logout: () => {
        setToken(null)
        setUser(null)
        localStorage.removeItem(STORAGE_KEY)
      },
    }),
    [token, user],
  )

  return (
    <AdminSessionContext.Provider value={value}>
      {children}
    </AdminSessionContext.Provider>
  )
}

export function useAdminSession() {
  const context = useContext(AdminSessionContext)

  if (!context) {
    throw new Error('useAdminSession must be used within AdminSessionProvider')
  }

  return context
}
