import { hash } from 'bcryptjs';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { loadEnv } from './load-env';
import {
  addresses,
  dropoffPoints,
  dropoffPointWasteTypes,
  schema,
  users,
  wasteTypes,
} from './schema';

loadEnv();

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to run the seed.');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminName = process.env.ADMIN_NAME;

  if (!adminPassword || !adminEmail || !adminName) {
    throw new Error('ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required.');
  }

  const passwordHash = await hash(adminPassword, 10);

  await db
    .insert(users)
    .values({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'admin',
      active: true,
    })
    .onConflictDoNothing();

  const wasteTypeRows = await db
    .insert(wasteTypes)
    .values([
      { name: 'Pilhas', description: 'Pilhas domesticas e alcalinas.' },
      { name: 'Baterias', description: 'Baterias pequenas e automotivas.' },
      { name: 'Eletronicos', description: 'Equipamentos eletronicos de pequeno porte.' },
      { name: 'Oleo de cozinha', description: 'Oleo usado para reciclagem.' },
      { name: 'Lampadas', description: 'Lampadas fluorescentes e LED.' },
      { name: 'Reciclaveis', description: 'Materiais reciclaveis em geral.' },
    ])
    .onConflictDoNothing()
    .returning();

  const allWasteTypes =
    wasteTypeRows.length > 0 ? wasteTypeRows : await db.select().from(wasteTypes);

  const createdAddresses = await db
    .insert(addresses)
    .values([
      { street: 'Rua das Flores', number: '120', district: 'Centro', city: 'Campo Grande', state: 'MS' },
      { street: 'Av. Principal', number: '988', district: 'Jardim America', city: 'Campo Grande', state: 'MS' },
      { street: 'Rua Norte', number: '45', district: 'Vila Nova', city: 'Campo Grande', state: 'MS' },
      { street: 'Rua Norte', number: '45', district: 'Vila Nova', city: 'Campo Grande', state: 'MS' },
      { street: 'Rua das Palmeiras', number: '310', district: 'Centro', city: 'Campo Grande', state: 'MS' },
    ])
    .returning();

  const createdPoints = await db
    .insert(dropoffPoints)
    .values([
      {
        name: 'Ecoponto Centro',
        description: 'Recebe pilhas, baterias pequenas e eletronicos portateis.',
        phone: '(67) 3000-0000',
        openingHours: 'Segunda a sexta, 8h as 17h',
        status: 'active',
        validationStatus: 'validated',
        addressId: createdAddresses[0].id,
      },
      {
        name: 'Mercado Boa Compra',
        description: 'Recebe pilhas comuns e baterias domesticas.',
        openingHours: 'Segunda a sabado, 8h as 20h',
        status: 'active',
        validationStatus: 'validated',
        addressId: createdAddresses[1].id,
      },
      {
        name: 'Cooperativa Verde',
        description: 'Recebe pilhas, reciclaveis e eletronicos pequenos.',
        status: 'active',
        validationStatus: 'needs_confirmation',
        addressId: createdAddresses[2].id,
      },
      {
        name: 'Loja TecnoMais',
        description: 'Recebe eletronicos pequenos e acessorios.',
        status: 'active',
        validationStatus: 'needs_confirmation',
        addressId: createdAddresses[3].id,
      },
      {
        name: 'Escola Municipal Verde',
        description: 'Campanha temporaria para oleo de cozinha usado.',
        status: 'active',
        validationStatus: 'validated',
        addressId: createdAddresses[4].id,
      },
    ])
    .returning();

  const wasteTypeByName = new Map(allWasteTypes.map((item) => [item.name, item.id]));

  await db.insert(dropoffPointWasteTypes).values([
    { dropoffPointId: createdPoints[0].id, wasteTypeId: wasteTypeByName.get('Pilhas')! },
    { dropoffPointId: createdPoints[0].id, wasteTypeId: wasteTypeByName.get('Baterias')! },
    { dropoffPointId: createdPoints[0].id, wasteTypeId: wasteTypeByName.get('Eletronicos')! },
    { dropoffPointId: createdPoints[1].id, wasteTypeId: wasteTypeByName.get('Pilhas')! },
    { dropoffPointId: createdPoints[1].id, wasteTypeId: wasteTypeByName.get('Baterias')! },
    { dropoffPointId: createdPoints[2].id, wasteTypeId: wasteTypeByName.get('Pilhas')! },
    { dropoffPointId: createdPoints[2].id, wasteTypeId: wasteTypeByName.get('Reciclaveis')! },
    { dropoffPointId: createdPoints[3].id, wasteTypeId: wasteTypeByName.get('Eletronicos')! },
    { dropoffPointId: createdPoints[4].id, wasteTypeId: wasteTypeByName.get('Oleo de cozinha')! },
  ]);

  await pool.end();
}

void run();
