import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 160 }).notNull(),
    email: varchar('email', { length: 180 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    role: varchar('role', { length: 40 }).notNull().default('admin'),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('users_email_idx').on(table.email)],
);

export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  street: varchar('street', { length: 180 }).notNull(),
  number: varchar('number', { length: 40 }).notNull(),
  district: varchar('district', { length: 120 }).notNull(),
  city: varchar('city', { length: 120 }).notNull(),
  state: varchar('state', { length: 2 }).notNull(),
  zipCode: varchar('zip_code', { length: 12 }),
  latitude: varchar('latitude', { length: 30 }),
  longitude: varchar('longitude', { length: 30 }),
});

export const wasteTypes = pgTable(
  'waste_types',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    description: text('description'),
    disposalGuidance: text('disposal_guidance'),
    active: boolean('active').notNull().default(true),
  },
  (table) => [uniqueIndex('waste_types_name_idx').on(table.name)],
);

export const dropoffPoints = pgTable(
  'dropoff_points',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 180 }).notNull(),
    description: text('description'),
    phone: varchar('phone', { length: 30 }),
    openingHours: text('opening_hours'),
    status: varchar('status', { length: 40 }).notNull().default('active'),
    validationStatus: varchar('validation_status', { length: 40 })
      .notNull()
      .default('validated'),
    addressId: integer('address_id')
      .notNull()
      .references(() => addresses.id, { onDelete: 'restrict' }),
    sourceSuggestionId: integer('source_suggestion_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('dropoff_points_address_id_idx').on(table.addressId)],
);

export const dropoffPointWasteTypes = pgTable(
  'dropoff_point_waste_types',
  {
    dropoffPointId: integer('dropoff_point_id')
      .notNull()
      .references(() => dropoffPoints.id, { onDelete: 'cascade' }),
    wasteTypeId: integer('waste_type_id')
      .notNull()
      .references(() => wasteTypes.id, { onDelete: 'cascade' }),
    note: text('note'),
    active: boolean('active').notNull().default(true),
  },
  (table) => [primaryKey({ columns: [table.dropoffPointId, table.wasteTypeId] })],
);

export const suggestions = pgTable('suggestions', {
  id: serial('id').primaryKey(),
  kind: varchar('kind', { length: 40 }).notNull(),
  status: varchar('status', { length: 40 }).notNull().default('pending'),
  placeName: varchar('place_name', { length: 180 }).notNull(),
  addressText: text('address_text').notNull(),
  districtText: varchar('district_text', { length: 120 }).notNull(),
  cityText: varchar('city_text', { length: 120 }).notNull(),
  wasteTypeText: varchar('waste_type_text', { length: 180 }).notNull(),
  openingHoursText: text('opening_hours_text'),
  note: text('note'),
  referencePointId: integer('reference_point_id').references(() => dropoffPoints.id, {
    onDelete: 'set null',
  }),
  reviewedByUserId: integer('reviewed_by_user_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  generatedPointId: integer('generated_point_id'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
});

export const schema = {
  users,
  addresses,
  wasteTypes,
  dropoffPoints,
  dropoffPointWasteTypes,
  suggestions,
};
