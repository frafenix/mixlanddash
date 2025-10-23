import { Injectable, ForbiddenException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';
import { contacts } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import * as z from 'zod';

// Schema completo per Anagrafica secondo campianagrafica.json
const AnagraficaSchema = z.object({
  tipoSoggetto: z.enum(['privato', 'azienda', 'pa', 'condominio']),
  isFornitore: z.boolean().default(false),
  ragioneSociale: z.string().optional(),
  nome: z.string().optional(),
  cognome: z.string().optional(),
  codiceFiscale: z.string().min(1, 'Codice fiscale obbligatorio'),
  partitaIva: z.string().optional(),
  
  // Fatturazione elettronica
  codiceDestinatarioSdi: z.string().optional(),
  codiceUnivocoIpa: z.string().optional(),
  pec: z.string().email().optional().or(z.literal('')),
  
  // Contatti
  email: z.string().email('Email non valida'),
  telefono: z.string().optional(),
  cellulare: z.string().optional(),
  
  // Indirizzo principale
  via: z.string().min(1, 'Via obbligatoria'),
  numeroCivico: z.string().optional(),
  cap: z.string().min(5, 'CAP deve essere di 5 cifre').max(5),
  citta: z.string().min(1, 'Città obbligatoria'),
  provincia: z.string().min(2, 'Provincia deve essere di 2 lettere').max(2),
  nazione: z.string().default('IT'),
  
  // Indirizzo spedizione
  indirizzoSpedizioneDiverso: z.boolean().default(false),
  viaSpedizione: z.string().optional(),
  numeroCivicoSpedizione: z.string().optional(),
  capSpedizione: z.string().optional(),
  cittaSpedizione: z.string().optional(),
  provinciaSpedizione: z.string().optional(),
  nazioneSpedizione: z.string().optional(),
  
  // Dati commerciali
  tipoCliente: z.string().optional(),
  iban: z.string().optional(),
  condizioniPagamento: z.string().optional(),
  
  // Referente (JSON)
  referente: z.string().optional(), // JSON string
  
  // Note e stato
  note: z.string().optional(),
  status: z.enum(['attivo', 'in_attesa', 'blacklist']).default('attivo'),
});

@Injectable()
export class ContactsService {
  constructor(@Inject('DRIZZLE_DB') private db: NodePgDatabase<typeof schema>) {}

  async create(user: any, data: z.infer<typeof AnagraficaSchema>) {
    const parsed = AnagraficaSchema.parse(data);
    
    // Converti boolean in string per il database
    const dbData = {
      ...parsed,
      isFornitore: parsed.isFornitore ? 'true' : 'false',
      indirizzoSpedizioneDiverso: parsed.indirizzoSpedizioneDiverso ? 'true' : 'false',
      tenantId: user.tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return this.db.insert(contacts).values(dbData).returning();
  }

  async findAll(user: any) {
    const results = await this.db.select().from(contacts).where(eq(contacts.tenantId, user.tenantId));
    
    // Converti string in boolean per la risposta
    return results.map(contact => ({
      ...contact,
      isFornitore: contact.isFornitore === 'true',
      indirizzoSpedizioneDiverso: contact.indirizzoSpedizioneDiverso === 'true',
    }));
  }

  async findOne(user: any, id: string) {
    const [contact] = await this.db.select().from(contacts).where(and(eq(contacts.id, id), eq(contacts.tenantId, user.tenantId)));
    if (!contact) throw new ForbiddenException('Contatto non trovato o non autorizzato');
    
    // Converti string in boolean per la risposta
    return {
      ...contact,
      isFornitore: contact.isFornitore === 'true',
      indirizzoSpedizioneDiverso: contact.indirizzoSpedizioneDiverso === 'true',
    };
  }

  async update(user: any, id: string, data: Partial<z.infer<typeof AnagraficaSchema>>) {
    const parsed = AnagraficaSchema.partial().parse(data);
    
    // Converti boolean in string per il database
    const dbData: any = {
      ...parsed,
      updatedAt: new Date(),
    };
    
    // Gestisci conversione boolean separatamente
    if (parsed.isFornitore !== undefined) {
      dbData.isFornitore = parsed.isFornitore ? 'true' : 'false';
    }
    if (parsed.indirizzoSpedizioneDiverso !== undefined) {
      dbData.indirizzoSpedizioneDiverso = parsed.indirizzoSpedizioneDiverso ? 'true' : 'false';
    }
    
    const results = await this.db.update(contacts).set(dbData).where(and(eq(contacts.id, id), eq(contacts.tenantId, user.tenantId))).returning();
    
    // Converti string in boolean per la risposta
    return results.map(contact => ({
      ...contact,
      isFornitore: contact.isFornitore === 'true',
      indirizzoSpedizioneDiverso: contact.indirizzoSpedizioneDiverso === 'true',
    }));
  }

  async delete(user: any, id: string) {
    return this.db.delete(contacts).where(and(eq(contacts.id, id), eq(contacts.tenantId, user.tenantId))).returning();
  }
}