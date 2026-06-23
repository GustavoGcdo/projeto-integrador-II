import { LogOut, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAdminSession } from '../../features/admin/hooks/useAdminSession.tsx'

export function AdminHeader() {
  const { logout, user } = useAdminSession()

  return (
    <header className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm text-slate-500">EcoDescarte Web</p>
        <div className="mt-1 flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-eco-600" />
          <h1 className="text-3xl font-bold text-slate-950">Painel administrativo</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">{user?.name ?? 'Administrador'}</span>
          <span className="ml-2">{user?.email}</span>
        </div>
        <Link className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold" to="/">
          Ver site
        </Link>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-eco-600 px-4 py-3 text-sm font-semibold text-white"
          type="button"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </header>
  )
}
