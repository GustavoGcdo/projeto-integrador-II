# EcoDescarte Web Frontend

Frontend da aplicacao EcoDescarte, construida com React, Vite, TypeScript e Tailwind CSS.

## Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS v4
- React Router
- Lucide React

## Telas principais

- `/` tela inicial com busca e atalhos por residuo
- `/pontos` listagem com filtros e mapa visual
- `/pontos/:id` detalhes do ponto
- `/sugerir-ponto` envio de sugestao publica
- `/admin/login` autenticacao administrativa
- `/admin` painel administrativo

## Variaveis de ambiente

Crie `web/.env` a partir de `.env.example`.

```env
VITE_API_URL=http://localhost:3000/api
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Desenvolvimento

Instale dependencias e rode:

```bash
npm install
npm run dev
```

O frontend espera que a API esteja disponivel em `VITE_API_URL`.

## Organizacao

- `src/features/publico`: paginas e fluxo publico
- `src/features/admin`: login e painel administrativo
- `src/components/ui`: componentes reutilizaveis
- `src/services/api`: client HTTP e chamadas da API
- `src/types`: contratos usados no frontend

## Comportamento importante

- o token administrativo e salvo em `localStorage`
- o mapa da aplicacao e visual, sem provider externo
- as telas seguem a estrutura funcional do projeto em implementacao React/Tailwind

## Arquivos relevantes

- rotas: [src/App.tsx](/mnt/d/Documentos/Gustavo/UFMS/projeto-integrador-II/web/src/App.tsx)
- estilos globais: [src/index.css](/mnt/d/Documentos/Gustavo/UFMS/projeto-integrador-II/web/src/index.css)
- client da API: [src/services/api/ecodescarte.ts](/mnt/d/Documentos/Gustavo/UFMS/projeto-integrador-II/web/src/services/api/ecodescarte.ts)
- sessao admin: [src/features/admin/hooks/useAdminSession.tsx](/mnt/d/Documentos/Gustavo/UFMS/projeto-integrador-II/web/src/features/admin/hooks/useAdminSession.tsx)
