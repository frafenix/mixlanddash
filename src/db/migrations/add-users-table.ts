import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export async function up(db: any) {
  // Crea la tabella users
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "users" (
      "id" text PRIMARY KEY,
      "email" text NOT NULL,
      "createdAt" timestamp DEFAULT now() NOT NULL,
      "lastLoginAt" timestamp,
      "onboardingStarted" boolean DEFAULT false,
      "onboardingCompleted" boolean DEFAULT false,
      "stripeCustomerId" text,
      "stripePriceId" text,
      "stripeSubscriptionId" text,
      "stripeCurrentPeriodEnd" timestamp,
      "metadata" jsonb
    );
  `);

  // Aggiorna la tabella companies per aggiungere la relazione con users
  await db.execute(sql`
    ALTER TABLE "companies" 
    ADD CONSTRAINT "companies_userId_users_id_fk" 
    FOREIGN KEY ("userId") REFERENCES "users" ("id") 
    ON DELETE CASCADE;
  `);
}

export async function down(db: any) {
  // Rimuovi la relazione
  await db.execute(sql`
    ALTER TABLE "companies" 
    DROP CONSTRAINT IF EXISTS "companies_userId_users_id_fk";
  `);

  // Elimina la tabella users
  await db.execute(sql`
    DROP TABLE IF EXISTS "users";
  `);
}