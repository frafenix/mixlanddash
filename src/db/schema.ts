import { pgTable, serial, text, varchar, jsonb, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enum per i ruoli del sistema RBAC
export const roleEnum = ['admin', 'manager', 'user'] as const;
export type Role = typeof roleEnum[number];

// Nuova tabella users per tracciare tutti gli utenti registrati
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(), // Stack Auth user ID
  email: text('email').notNull(),
  role: text('role', { enum: roleEnum }).default('user').notNull(), // RBAC role
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

// Tabella per gestire gli inviti utente
export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  token: varchar('token', { length: 255 }).notNull().unique(), // Token sicuro per il link
  email: text('email').notNull(),
  role: text('role', { enum: roleEnum }).notNull(), // Ruolo pre-assegnato
  invitedBy: varchar('invited_by', { length: 255 }).notNull().references(() => users.id), // Admin che ha inviato l'invito
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'cascade' }), // Opzionale: invito per specifica company
  teamId: integer('team_id').references(() => teams.id, { onDelete: 'cascade' }), // Opzionale: invito per specifico team
  status: text('status', { enum: ['pending', 'accepted', 'expired', 'revoked'] }).default('pending').notNull(),
  expiresAt: timestamp('expires_at').notNull(), // Scadenza invito (es. 7 giorni)
  acceptedAt: timestamp('accepted_at'),
  acceptedBy: varchar('accepted_by', { length: 255 }).references(() => users.id), // User che ha accettato
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
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

// Tabella per gestire le presenze mensili
export const attendances = pgTable('attendances', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  month: integer('month').notNull(), // 1-12
  year: integer('year').notNull(),
  days: jsonb('days').notNull(), // Array of { date: string, hours: number, mealVoucher: boolean, workLocation: 'office' | 'remote' }
  status: text('status', { enum: ['pending', 'submitted', 'approved', 'rejected'] }).default('pending').notNull(),
  submittedAt: timestamp('submitted_at'),
  approvedAt: timestamp('approved_at'),
  approvedBy: varchar('approved_by', { length: 255 }).references(() => users.id),
  rejectedAt: timestamp('rejected_at'),
  rejectedBy: varchar('rejected_by', { length: 255 }).references(() => users.id),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Tabella per gestire le richieste di ferie
export const holidays = pgTable('holidays', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  days: integer('days').notNull(), // Numero di giorni di ferie richiesti
  reason: text('reason'),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] }).default('pending').notNull(),
  approvedAt: timestamp('approved_at'),
  approvedBy: varchar('approved_by', { length: 255 }).references(() => users.id),
  rejectedAt: timestamp('rejected_at'),
  rejectedBy: varchar('rejected_by', { length: 255 }).references(() => users.id),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  companies: many(companies),
  sentInvitations: many(invitations, { relationName: 'invitedBy' }),
  acceptedInvitations: many(invitations, { relationName: 'acceptedBy' }),
  attendances: many(attendances),
  holidays: many(holidays),
  approvedAttendances: many(attendances, { relationName: 'approvedBy' }),
  rejectedAttendances: many(attendances, { relationName: 'rejectedBy' }),
  approvedHolidays: many(holidays, { relationName: 'approvedBy' }),
  rejectedHolidays: many(holidays, { relationName: 'rejectedBy' }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  inviter: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
    relationName: 'invitedBy',
  }),
  accepter: one(users, {
    fields: [invitations.acceptedBy],
    references: [users.id],
    relationName: 'acceptedBy',
  }),
  company: one(companies, {
    fields: [invitations.companyId],
    references: [companies.id],
  }),
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
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

export const attendancesRelations = relations(attendances, ({ one }) => ({
  user: one(users, {
    fields: [attendances.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [attendances.companyId],
    references: [companies.id],
  }),
  approver: one(users, {
    fields: [attendances.approvedBy],
    references: [users.id],
    relationName: 'approvedBy',
  }),
  rejecter: one(users, {
    fields: [attendances.rejectedBy],
    references: [users.id],
    relationName: 'rejectedBy',
  }),
}));

export const holidaysRelations = relations(holidays, ({ one }) => ({
  user: one(users, {
    fields: [holidays.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [holidays.companyId],
    references: [companies.id],
  }),
  approver: one(users, {
    fields: [holidays.approvedBy],
    references: [users.id],
    relationName: 'approvedBy',
  }),
  rejecter: one(users, {
    fields: [holidays.rejectedBy],
    references: [users.id],
    relationName: 'rejectedBy',
  }),
}));