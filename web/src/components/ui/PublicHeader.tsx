import { Recycle } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PublicHeader() {
  return (
    <header className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white/90 px-6 py-5 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
      <Link to="/" className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-eco-600 text-white">
          <Recycle className="h-5 w-5" />
        </div>
        <div>
          <strong className="block text-xl text-eco-900">EcoDescarte Web</strong>
          <span className="text-sm text-slate-500">Pontos de descarte correto</span>
        </div>
      </Link>

      <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <Link className="rounded-full px-3 py-2 hover:bg-slate-100" to="/pontos">
          Buscar pontos
        </Link>
        <Link className="rounded-full px-3 py-2 hover:bg-slate-100" to="/sugerir-ponto">
          Sugerir ponto
        </Link>
        <Link
          className="rounded-xl border border-eco-600 px-4 py-2 font-medium text-eco-700"
          to="/admin/login"
        >
          Entrar
        </Link>
      </nav>
    </header>
  )
}
