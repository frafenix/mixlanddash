import { pgTable, text, timestamp, boolean, jsonb, varchar } from 'drizzle-orm/pg-core';
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

/*
ISTRUZIONI PER L'INTEGRAZIONE:

1. Aggiungere la tabella 'users' a schema.ts

2. Modificare le relazioni esistenti in schema.ts:
   - Aggiornare companiesRelations per includere la relazione con users:
     
     export const companiesRelations = relations(companies, ({ many, one }) => ({
       locations: many(locations),
       teams: many(teams),
       user: one(users, {
         fields: [companies.userId],
         references: [users.id],
       }),
     }));

3. Aggiungere le relazioni per users:
   
   export const usersRelations = relations(users, ({ many }) => ({
     companies: many(companies),
   }));

4. Creare una migrazione per aggiungere la nuova tabella al database
*/