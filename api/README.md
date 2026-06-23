# EcoDescarte API

API REST do EcoDescarte Web, implementada com NestJS, Drizzle ORM e PostgreSQL.

## Stack

- NestJS 11
- Drizzle ORM
- PostgreSQL
- JWT para autenticacao administrativa
- class-validator e class-transformer para validacao

## Modulos principais

- `auth`: login administrativo
- `waste-types`: tipos de residuo
- `dropoff-points`: consulta e manutencao de pontos
- `suggestions`: sugestoes publicas e correcoes
- `admin`: dashboard e fluxo administrativo
- `database`: conexao, schema, migration e seed

## Variaveis de ambiente

Crie `api/.env` a partir de `.env.example`.

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

## Scripts

```bash
npm run start
npm run start:dev
npm run build
npm run lint
npm run test
npm run test:e2e
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

## Banco de dados

Fluxo recomendado:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Arquivos relevantes:

- schema: [src/database/schema.ts](/mnt/d/Documentos/Gustavo/UFMS/projeto-integrador-II/api/src/database/schema.ts)
- migrate: [src/database/migrate.ts](/mnt/d/Documentos/Gustavo/UFMS/projeto-integrador-II/api/src/database/migrate.ts)
- seed: [src/database/seed.ts](/mnt/d/Documentos/Gustavo/UFMS/projeto-integrador-II/api/src/database/seed.ts)
- config do Drizzle: [drizzle.config.ts](/mnt/d/Documentos/Gustavo/UFMS/projeto-integrador-II/api/drizzle.config.ts)

## Endpoints principais

Publicos:

- `GET /api`
- `GET /api/waste-types`
- `GET /api/dropoff-points`
- `GET /api/dropoff-points/:id`
- `POST /api/suggestions`
- `POST /api/dropoff-points/:id/corrections`

Administrativos:

- `POST /api/auth/login`
- `GET /api/admin/dashboard`
- `GET /api/admin/suggestions`
- `PATCH /api/admin/suggestions/:id`
- `POST /api/admin/suggestions/:id/approve`
- `POST /api/admin/suggestions/:id/reject`
- `GET /api/admin/dropoff-points`
- `POST /api/admin/dropoff-points`
- `PATCH /api/admin/dropoff-points/:id`
- `PATCH /api/admin/dropoff-points/:id/inactivate`
- `GET /api/admin/waste-types`
- `POST /api/admin/waste-types`
- `PATCH /api/admin/waste-types/:id`

## Seed inicial

O seed cria:

- usuario admin inicial
- tipos de residuo
- pontos de descarte iniciais para ambiente local

Pontos incluidos:

- Ecoponto Centro
- Mercado Boa Compra
- Cooperativa Verde
- Loja TecnoMais
- Escola Municipal Verde

## Desenvolvimento

Subir em modo watch:

```bash
npm run start:dev
```

Se `DATABASE_URL` nao for reconhecida em migration ou seed, confirme que o `.env` esta em `api/.env`. Os scripts carregam esse arquivo automaticamente.
