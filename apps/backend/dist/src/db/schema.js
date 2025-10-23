"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contacts = exports.userTenants = exports.tenants = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const cuid2_1 = require("@paralleldrive/cuid2");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    passwordHash: (0, pg_core_1.text)('password_hash').notNull(),
    tenantId: (0, pg_core_1.text)('tenant_id').notNull().references(() => exports.tenants.id, { onDelete: 'cascade' }),
    firstName: (0, pg_core_1.text)('first_name'),
    lastName: (0, pg_core_1.text)('last_name'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    emailIndex: (0, pg_core_1.uniqueIndex)('users_email_idx').on(table.email),
}));
exports.tenants = (0, pg_core_1.pgTable)('tenants', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    name: (0, pg_core_1.text)('name').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.userTenants = (0, pg_core_1.pgTable)('user_tenants', {
    userId: (0, pg_core_1.text)('user_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    tenantId: (0, pg_core_1.text)('tenant_id').notNull().references(() => exports.tenants.id, { onDelete: 'cascade' }),
}, (table) => ({
    pk: (0, pg_core_1.primaryKey)({ columns: [table.userId, table.tenantId] }),
}));
exports.contacts = (0, pg_core_1.pgTable)('contacts', {
    id: (0, pg_core_1.text)('id').primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    tenantId: (0, pg_core_1.text)('tenant_id').notNull().references(() => exports.tenants.id, { onDelete: 'cascade' }),
    tipoSoggetto: (0, pg_core_1.text)('tipo_soggetto').notNull(),
    isFornitore: (0, pg_core_1.text)('is_fornitore').default('false'),
    ragioneSociale: (0, pg_core_1.text)('ragione_sociale'),
    nome: (0, pg_core_1.text)('nome'),
    cognome: (0, pg_core_1.text)('cognome'),
    codiceFiscale: (0, pg_core_1.text)('codice_fiscale').notNull(),
    partitaIva: (0, pg_core_1.text)('partita_iva'),
    codiceDestinatarioSdi: (0, pg_core_1.text)('codice_destinatario_sdi'),
    codiceUnivocoIpa: (0, pg_core_1.text)('codice_univoco_ipa'),
    pec: (0, pg_core_1.text)('pec'),
    email: (0, pg_core_1.text)('email').notNull(),
    telefono: (0, pg_core_1.text)('telefono'),
    cellulare: (0, pg_core_1.text)('cellulare'),
    via: (0, pg_core_1.text)('via').notNull(),
    numeroCivico: (0, pg_core_1.text)('numero_civico'),
    cap: (0, pg_core_1.text)('cap').notNull(),
    citta: (0, pg_core_1.text)('citta').notNull(),
    provincia: (0, pg_core_1.text)('provincia').notNull(),
    nazione: (0, pg_core_1.text)('nazione').default('IT'),
    indirizzoSpedizioneDiverso: (0, pg_core_1.text)('indirizzo_spedizione_diverso').default('false'),
    viaSpedizione: (0, pg_core_1.text)('via_spedizione'),
    numeroCivicoSpedizione: (0, pg_core_1.text)('numero_civico_spedizione'),
    capSpedizione: (0, pg_core_1.text)('cap_spedizione'),
    cittaSpedizione: (0, pg_core_1.text)('citta_spedizione'),
    provinciaSpedizione: (0, pg_core_1.text)('provincia_spedizione'),
    nazioneSpedizione: (0, pg_core_1.text)('nazione_spedizione'),
    tipoCliente: (0, pg_core_1.text)('tipo_cliente'),
    iban: (0, pg_core_1.text)('iban'),
    condizioniPagamento: (0, pg_core_1.text)('condizioni_pagamento'),
    referente: (0, pg_core_1.text)('referente'),
    note: (0, pg_core_1.text)('note'),
    status: (0, pg_core_1.text)('status').default('attivo'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    emailTenantIndex: (0, pg_core_1.uniqueIndex)('contacts_email_tenant_idx').on(table.email, table.tenantId),
    codiceFiscaleIndex: (0, pg_core_1.uniqueIndex)('contacts_codice_fiscale_tenant_idx').on(table.codiceFiscale, table.tenantId),
}));
//# sourceMappingURL=schema.js.map