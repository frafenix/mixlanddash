CREATE TABLE "contacts" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"company" text,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"vat_number" text,
	"tax_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "contacts_email_idx" ON "contacts" USING btree ("email");