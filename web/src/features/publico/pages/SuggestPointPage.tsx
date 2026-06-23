import { useEffect, useState } from 'react'
import { AppShell } from '../../../components/ui/AppShell.tsx'
import { PublicHeader } from '../../../components/ui/PublicHeader.tsx'
import { SuggestionForm } from '../../../components/ui/SuggestionForm.tsx'
import { ecodescarteApi } from '../../../services/api/ecodescarte.ts'
import type { WasteType } from '../../../types/models.ts'

export function SuggestPointPage() {
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([])

  useEffect(() => {
    ecodescarteApi.listWasteTypes().then(setWasteTypes).catch(() => setWasteTypes([]))
  }, [])

  return (
    <AppShell header={<PublicHeader />}>
      <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_360px]">
        <SuggestionForm
          description="Indique locais que recebem residuos. A sugestao sera analisada antes de aparecer publicamente."
          kind="new_point"
          submitLabel="Enviar sugestao"
          title="Sugerir novo ponto de descarte"
          wasteTypes={wasteTypes}
          onSubmit={(payload) => ecodescarteApi.createSuggestion(payload).then(() => undefined)}
        />

        <aside className="space-y-4">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
            <h2 className="font-bold text-slate-950">Fluxo da sugestao</h2>
            <ol className="mt-4 space-y-4 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-eco-600 text-xs text-white">1</span>
                Usuario informa o local.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-eco-600 text-xs text-white">2</span>
                Sugestao entra como pendente.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-eco-600 text-xs text-white">3</span>
                Administrador valida as informacoes.
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-eco-600 text-xs text-white">4</span>
                Ponto aprovado aparece na busca.
              </li>
            </ol>
          </div>

          <div className="rounded-[24px] bg-eco-600 p-5 text-white">
            <h2 className="font-bold">Por que validar?</h2>
            <p className="mt-2 text-sm text-eco-50">
              A validacao evita informacoes incorretas, pontos inexistentes ou locais com dados desatualizados.
            </p>
          </div>
        </aside>
      </section>
    </AppShell>
  )
}
