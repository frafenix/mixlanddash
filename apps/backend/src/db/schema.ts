import { pgTable, serial, text, timestamp, uniqueIndex, primaryKey } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';



// Tabella per Utenti (per autenticazione multi-tenant)
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIndex: uniqueIndex('users_email_idx').on(table.email),
}));

// Tabella per Tenant/Organizzazioni (multi-tenancy)
export const tenants = pgTable('tenants', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relazione User-Tenant (molti-a-molti per flessibilità)
export const userTenants = pgTable('user_tenants', {
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.tenantId] }),
}));

// Tabella Anagrafiche completa secondo campianagrafica.json
export const contacts = pgTable('contacts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  
  // Tipologia e identificazione
  tipoSoggetto: text('tipo_soggetto').notNull(), // privato, azienda, pa, condominio
  isFornitore: text('is_fornitore').default('false'), // boolean as text
  ragioneSociale: text('ragione_sociale'),
  nome: text('nome'),
  cognome: text('cognome'),
  codiceFiscale: text('codice_fiscale').notNull(),
  partitaIva: text('partita_iva'),
  
  // Fatturazione elettronica
  codiceDestinatarioSdi: text('codice_destinatario_sdi'),
  codiceUnivocoIpa: text('codice_univoco_ipa'),
  pec: text('pec'),
  
  // Contatti
  email: text('email').notNull(),
  telefono: text('telefono'),
  cellulare: text('cellulare'),
  
  // Indirizzo principale
  via: text('via').notNull(),
  numeroCivico: text('numero_civico'),
  cap: text('cap').notNull(),
  citta: text('citta').notNull(),
  provincia: text('provincia').notNull(),
  nazione: text('nazione').default('IT'),
  
  // Indirizzo spedizione (se diverso)
  indirizzoSpedizioneDiverso: text('indirizzo_spedizione_diverso').default('false'), // boolean as text
  viaSpedizione: text('via_spedizione'),
  numeroCivicoSpedizione: text('numero_civico_spedizione'),
  capSpedizione: text('cap_spedizione'),
  cittaSpedizione: text('citta_spedizione'),
  provinciaSpedizione: text('provincia_spedizione'),
  nazioneSpedizione: text('nazione_spedizione'),
  
  // Dati commerciali
  tipoCliente: text('tipo_cliente'), // nuovo, abituale, vip, etc.
  iban: text('iban'),
  condizioniPagamento: text('condizioni_pagamento'),
  
  // Referente (JSON)
  referente: text('referente'), // JSON string: {nome, ruolo, telefono, email}
  
  // Note
  note: text('note'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailTenantIndex: uniqueIndex('contacts_email_tenant_idx').on(table.email, table.tenantId),
  codiceFiscaleIndex: uniqueIndex('contacts_codice_fiscale_tenant_idx').on(table.codiceFiscale, table.tenantId),
}));

// Aggiungi altre tabelle se necessario, ma mantieni focalizzato su F1 e auth