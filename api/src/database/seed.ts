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
      {
        street: 'Rua das Flores',
        number: '120',
        district: 'Centro',
        city: 'Campo Grande',
        state: 'MS',
        latitude: '-20.469710',
        longitude: '-54.620121',
      },
      {
        street: 'Av. Principal',
        number: '988',
        district: 'Jardim America',
        city: 'Campo Grande',
        state: 'MS',
        latitude: '-20.497779',
        longitude: '-54.611643',
      },
      {
        street: 'Rua Norte',
        number: '45',
        district: 'Vila Nova',
        city: 'Campo Grande',
        state: 'MS',
        latitude: '-20.448171',
        longitude: '-54.597503',
      },
      {
        street: 'Rua Norte',
        number: '45',
        district: 'Vila Nova',
        city: 'Campo Grande',
        state: 'MS',
        latitude: '-20.451338',
        longitude: '-54.585663',
      },
      {
        street: 'Rua das Palmeiras',
        number: '310',
        district: 'Centro',
        city: 'Campo Grande',
        state: 'MS',
        latitude: '-20.462808',
        longitude: '-54.606481',
      },
      {
        street: 'Av. Roseira',
        number: '912',
        district: 'Parque Res. Uniao',
        city: 'Campo Grande',
        state: 'MS',
        zipCode: '79006-830',
        latitude: '-20.487406462239598',
        longitude: '-54.66787526639539',
      },
      {
        street: 'Av. Jose Barbosa Rodrigues',
        number: '196',
        district: 'Vila Manoel Taveira',
        city: 'Campo Grande',
        state: 'MS',
        zipCode: '79113-160',
        latitude: '-20.433366926204855',
        longitude: '-54.671308493849615',
      },
      {
        street: 'R. Guarulhos',
        number: '788',
        district: 'Jardim Noroeste',
        city: 'Campo Grande',
        state: 'MS',
        zipCode: '79045-200',
        latitude: '-20.459363458243274',
        longitude: '-54.547388286001656',
      },
      {
        street: 'R. Pacajus',
        number: '194',
        district: 'Vila Palmira',
        city: 'Campo Grande',
        state: 'MS',
        zipCode: '79017-793',
        latitude: '-20.38000324507663',
        longitude: '-54.56876288600166',
      },
      {
        street: 'R. Copaiba',
        number: '640',
        district: 'Moreninha',
        city: 'Campo Grande',
        state: 'MS',
        zipCode: '79065-710',
        latitude: '-20.55788510461674',
        longitude: '-54.57009359501995',
      },
      {
        street: 'Av. Gunter Hans',
        number: '2055',
        district: 'Amambai',
        city: 'Campo Grande',
        state: 'MS',
        zipCode: '79085-000',
        latitude: '-20.50145860020367',
        longitude: '-54.651461085684986',
      },
      {
        street: 'Av. Pref. Heraclito Diniz de Figueiredo',
        number: 'S/N',
        district: 'Seminario',
        city: 'Campo Grande',
        state: 'MS',
        zipCode: '79118-152',
        latitude: '-20.425364928873368',
        longitude: '-54.616169640510805',
      },
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
      {
        name: 'EcoPonto Uniao',
        description: 'Ecoponto municipal para entrega voluntaria de materiais reciclaveis.',
        status: 'active',
        validationStatus: 'validated',
        addressId: createdAddresses[5].id,
      },
      {
        name: 'Ecoponto Panama',
        description: 'Ecoponto municipal para entrega voluntaria de materiais reciclaveis.',
        status: 'active',
        validationStatus: 'validated',
        addressId: createdAddresses[6].id,
      },
      {
        name: 'EcoPonto Noroeste',
        description: 'Ecoponto municipal para entrega voluntaria de materiais reciclaveis.',
        status: 'active',
        validationStatus: 'validated',
        addressId: createdAddresses[7].id,
      },
      {
        name: 'EcoPonto Nova Lima',
        description: 'Ecoponto municipal para entrega voluntaria de materiais reciclaveis.',
        status: 'active',
        validationStatus: 'validated',
        addressId: createdAddresses[8].id,
      },
      {
        name: 'EcoPonto Moreninha',
        description: 'Ecoponto municipal para entrega voluntaria de materiais reciclaveis.',
        status: 'active',
        validationStatus: 'validated',
        addressId: createdAddresses[9].id,
      },
      {
        name: 'Solurb - Setor de Coleta de Residuos Solidos',
        description: 'Unidade de apoio para coleta e destinacao de residuos solidos urbanos.',
        status: 'active',
        validationStatus: 'validated',
        addressId: createdAddresses[10].id,
      },
      {
        name: 'Drive Thru Ecologico Ecoplantar',
        description: 'Ponto de entrega voluntaria para descarte ambientalmente adequado.',
        status: 'active',
        validationStatus: 'validated',
        addressId: createdAddresses[11].id,
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
    { dropoffPointId: createdPoints[5].id, wasteTypeId: wasteTypeByName.get('Reciclaveis')! },
    { dropoffPointId: createdPoints[6].id, wasteTypeId: wasteTypeByName.get('Reciclaveis')! },
    { dropoffPointId: createdPoints[7].id, wasteTypeId: wasteTypeByName.get('Reciclaveis')! },
    { dropoffPointId: createdPoints[8].id, wasteTypeId: wasteTypeByName.get('Reciclaveis')! },
    { dropoffPointId: createdPoints[9].id, wasteTypeId: wasteTypeByName.get('Reciclaveis')! },
    { dropoffPointId: createdPoints[10].id, wasteTypeId: wasteTypeByName.get('Reciclaveis')! },
    { dropoffPointId: createdPoints[11].id, wasteTypeId: wasteTypeByName.get('Reciclaveis')! },
  ]);

  await pool.end();
}

void run();
