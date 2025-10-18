import { pgTable, serial, text, varchar, jsonb, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Nuova tabella users per tracciare tutti gli utenti registrati
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(), // Stack Auth user ID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
  onboardingStarted: boolean('onboarding_started').default(false),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status'),
  subscriptionPlan: text('subscription_plan'),
  metadata: jsonb('metadata'),
});

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
export const usersRelations = relations(users, ({ many }) => ({
  companies: many(companies),
}));

export const companiesRelations = relations(companies, ({ many, one }) => ({
  locations: many(locations),
  teams: many(teams),
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
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