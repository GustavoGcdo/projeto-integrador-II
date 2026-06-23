# EcoDescarte Web

Aplicacao web para consulta e validacao de pontos de descarte correto de residuos. O projeto esta organizado como um monorepo simples, com frontend React em `web` e backend NestJS em `api`.

## Estrutura

```text
.
|-- api/    # API NestJS + Drizzle + PostgreSQL
`-- web/    # Frontend React + Vite + Tailwind
```

## Funcionalidades

- consulta publica de pontos de descarte
- filtro por tipo de residuo, bairro e busca livre
- detalhes completos de cada ponto
- sugestao publica de novo ponto
- sugestao publica de correcao de ponto existente
- painel administrativo com login JWT
- aprovacao, rejeicao e manutencao de pontos e tipos de residuo

## Requisitos

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Setup rapido

1. Instale as dependencias:

```bash
cd api
npm install

cd ../web
npm install
```

2. Configure os arquivos de ambiente:

```bash
cp api/.env.example api/.env
cp web/.env.example web/.env
```

3. Ajuste `api/.env` com a conexao real do PostgreSQL.

4. Gere e aplique as migrations, depois alimente a base:

```bash
cd api
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. Suba a API e o frontend em terminais separados:

```bash
cd api
npm run start:dev
```

```bash
cd web
npm run dev
```

## Ambientes

`api/.env`

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ecodescarte
JWT_SECRET=ecodescarte-dev-secret
JWT_EXPIRES_IN=12h
ADMIN_NAME=Administrador EcoDescarte
ADMIN_EMAIL=admin@ecodescarte.local
ADMIN_PASSWORD=123456
```

`web/.env`

```env
VITE_API_URL=http://localhost:3000/api
```

## Enderecos locais

- frontend: `http://localhost:5173`
- API: `http://localhost:3000/api`
- health check: `http://localhost:3000/api`

## Fluxo inicial

- o seed cria tipos de residuo e pontos iniciais para desenvolvimento
- o usuario admin inicial vem de `ADMIN_NAME`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`
- o painel administrativo usa autenticacao JWT

## Referencias do projeto

- backend: [api/README.md](/mnt/d/Documentos/Gustavo/UFMS/projeto-integrador-II/api/README.md)
- frontend: [web/README.md](/mnt/d/Documentos/Gustavo/UFMS/projeto-integrador-II/web/README.md)

## Observacoes

- o mapa usa tiles gratuitos do OpenStreetMap e depende de coordenadas cadastradas nos pontos
- sugestoes de novo ponto e correcoes compartilham a mesma fila administrativa
- se o ambiente local bloquear Node em WSL 1, execute os scripts em WSL 2 ou no Windows nativo
