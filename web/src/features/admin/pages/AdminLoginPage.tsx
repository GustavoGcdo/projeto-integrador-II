import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AppShell } from '../../../components/ui/AppShell.tsx'
import { ecodescarteApi } from '../../../services/api/ecodescarte.ts'
import { useAdminSession } from '../hooks/useAdminSession.tsx'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { login, token } = useAdminSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (token) {
    return <Navigate to="/admin" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await ecodescarteApi.login(email, password)
      login(response.accessToken, response.user)
      navigate('/admin')
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Nao foi possivel autenticar.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppShell>
      <section className="flex flex-1 items-center justify-center py-6">
        <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl">
          <p className="text-sm text-slate-500">EcoDescarte Web</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Entrar no painel</h1>
          <p className="mt-3 text-slate-600">
            Acesse a area administrativa para validar pontos e sugestoes.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="email">
                E-mail
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                id="email"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                Senha
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
                id="password"
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              className="w-full rounded-xl bg-eco-600 py-3 font-semibold text-white disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  )
}
