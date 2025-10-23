ALTER TABLE "contacts" ADD COLUMN "tipo_soggetto" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "is_fornitore" text DEFAULT 'false';--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "ragione_sociale" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "nome" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "cognome" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "codice_fiscale" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "partita_iva" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "codice_destinatario_sdi" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "codice_univoco_ipa" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "pec" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "telefono" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "cellulare" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "via" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "numero_civico" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "cap" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "citta" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "provincia" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "nazione" text DEFAULT 'IT';--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "indirizzo_spedizione_diverso" text DEFAULT 'false';--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "via_spedizione" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "numero_civico_spedizione" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "cap_spedizione" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "citta_spedizione" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "provincia_spedizione" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "nazione_spedizione" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "tipo_cliente" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "iban" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "condizioni_pagamento" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "referente" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "status" text DEFAULT 'attivo';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tenant_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "contacts_codice_fiscale_tenant_idx" ON "contacts" USING btree ("codice_fiscale","tenant_id");--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "company";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "vat_number";--> statement-breakpoint
ALTER TABLE "contacts" DROP COLUMN "tax_code";