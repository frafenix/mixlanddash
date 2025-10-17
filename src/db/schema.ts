import { pgTable, serial, text, varchar, jsonb, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(), // Reference to Stack Auth user ID
  name: text('name').notNull(),
  otherInfo: jsonb('other_info'), // Flexible JSON for additional company info
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  address: text('address').notNull(),
  city: text('city'),
  country: text('country'),
  zipCode: varchar('zip_code', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  members: jsonb('members'), // Array of { userId: string, role: string }
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  locations: many(locations),
  teams: many(teams),
}));

export const locationsRelations = relations(locations, ({ one }) => ({
  company: one(companies, {
    fields: [locations.companyId],
    references: [companies.id],
  }),
}));

export const teamsRelations = relations(teams, ({ one }) => ({
  company: one(companies, {
    fields: [teams.companyId],
    references: [companies.id],
  }),
}));