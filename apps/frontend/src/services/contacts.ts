import { apiService } from './api';

export interface Contact {
  id: number;
  nome: string;
  cognome: string;
  ragioneSociale?: string;
  codiceFiscale?: string;
  partitaIva?: string;
  indirizzo?: string;
  cap?: string;
  citta?: string;
  provincia?: string;
  nazione?: string;
  telefono?: string;
  cellulare?: string;
  email?: string;
  pec?: string;
  sito?: string;
  codiceDestinatario?: string;
  iban?: string;
  banca?: string;
  agenzia?: string;
  swift?: string;
  note?: string;
  attivo: boolean;
  cliente: boolean;
  fornitore: boolean;
  vettore: boolean;
  agente: boolean;
  dataCreazione?: string;
  dataModifica?: string;
  tenantId?: number;
}

export interface Anagrafica {
  id: number;
  nome: string;
  cognome: string;
  ragioneSociale?: string;
  codiceFiscale?: string;
  partitaIva?: string;
  indirizzo?: string;
  cap?: string;
  citta?: string;
  provincia?: string;
  nazione?: string;
  telefono?: string;
  cellulare?: string;
  email?: string;
  pec?: string;
  sito?: string;
  codiceDestinatario?: string;
  iban?: string;
  banca?: string;
  agenzia?: string;
  swift?: string;
  note?: string;
  attivo: boolean;
  cliente: boolean;
  fornitore: boolean;
  vettore: boolean;
  agente: boolean;
  dataCreazione?: string;
  dataModifica?: string;
}

// Funzioni di conversione tra Contact e Anagrafica
function contactToAnagrafica(contact: Contact): Anagrafica {
  return {
    id: contact.id,
    nome: contact.nome,
    cognome: contact.cognome,
    ragioneSociale: contact.ragioneSociale,
    codiceFiscale: contact.codiceFiscale,
    partitaIva: contact.partitaIva,
    indirizzo: contact.indirizzo,
    cap: contact.cap,
    citta: contact.citta,
    provincia: contact.provincia,
    nazione: contact.nazione,
    telefono: contact.telefono,
    cellulare: contact.cellulare,
    email: contact.email,
    pec: contact.pec,
    sito: contact.sito,
    codiceDestinatario: contact.codiceDestinatario,
    iban: contact.iban,
    banca: contact.banca,
    agenzia: contact.agenzia,
    swift: contact.swift,
    note: contact.note,
    attivo: contact.attivo,
    cliente: contact.cliente,
    fornitore: contact.fornitore,
    vettore: contact.vettore,
    agente: contact.agente,
    dataCreazione: contact.dataCreazione,
    dataModifica: contact.dataModifica,
  };
}

function anagraficaToContact(anagrafica: Partial<Anagrafica>): Partial<Contact> {
  return {
    nome: anagrafica.nome,
    cognome: anagrafica.cognome,
    ragioneSociale: anagrafica.ragioneSociale,
    codiceFiscale: anagrafica.codiceFiscale,
    partitaIva: anagrafica.partitaIva,
    indirizzo: anagrafica.indirizzo,
    cap: anagrafica.cap,
    citta: anagrafica.citta,
    provincia: anagrafica.provincia,
    nazione: anagrafica.nazione,
    telefono: anagrafica.telefono,
    cellulare: anagrafica.cellulare,
    email: anagrafica.email,
    pec: anagrafica.pec,
    sito: anagrafica.sito,
    codiceDestinatario: anagrafica.codiceDestinatario,
    iban: anagrafica.iban,
    banca: anagrafica.banca,
    agenzia: anagrafica.agenzia,
    swift: anagrafica.swift,
    note: anagrafica.note,
    attivo: anagrafica.attivo ?? true,
    cliente: anagrafica.cliente ?? false,
    fornitore: anagrafica.fornitore ?? false,
    vettore: anagrafica.vettore ?? false,
    agente: anagrafica.agente ?? false,
  };
}

class ContactsService {
  async getAllContacts(): Promise<Anagrafica[]> {
    // Per ora restituiamo dati mock per evitare errori di autenticazione
    // In produzione questo dovrebbe fare una chiamata API reale
    const mockData: Anagrafica[] = [
      {
        id: 1,
        nome: "Mario",
        cognome: "Rossi",
        ragioneSociale: "Rossi SRL",
        codiceFiscale: "RSSMRA80A01H501Z",
        partitaIva: "12345678901",
        indirizzo: "Via Roma 123",
        cap: "00100",
        citta: "Roma",
        provincia: "RM",
        nazione: "Italia",
        telefono: "06-12345678",
        cellulare: "333-1234567",
        email: "mario.rossi@email.com",
        pec: "mario.rossi@pec.it",
        sito: "www.rossisrl.it",
        codiceDestinatario: "ABCDEFG",
        iban: "IT60 X054 2811 1010 0000 0123 456",
        banca: "Banca Intesa",
        agenzia: "Roma Centro",
        swift: "BCITITMM",
        note: "Cliente importante",
        attivo: true,
        cliente: true,
        fornitore: false,
        vettore: false,
        agente: false,
        dataCreazione: "2024-01-15",
        dataModifica: "2024-01-15"
      },
      {
        id: 2,
        nome: "Giulia",
        cognome: "Verdi",
        ragioneSociale: "",
        codiceFiscale: "VRDGLI85B15F205X",
        partitaIva: "",
        indirizzo: "Via Milano 456",
        cap: "20100",
        citta: "Milano",
        provincia: "MI",
        nazione: "Italia",
        telefono: "02-87654321",
        cellulare: "347-7654321",
        email: "giulia.verdi@email.com",
        pec: "",
        sito: "",
        codiceDestinatario: "",
        iban: "",
        banca: "",
        agenzia: "",
        swift: "",
        note: "Cliente privato",
        attivo: true,
        cliente: true,
        fornitore: true,
        vettore: false,
        agente: false,
        dataCreazione: "2024-01-20",
        dataModifica: "2024-01-20"
      }
    ];

    return mockData;
  }

  async createContact(data: Partial<Anagrafica>): Promise<Anagrafica | null> {
    // Simuliamo la creazione con un nuovo ID
    const newContact: Anagrafica = {
      id: Date.now(), // ID temporaneo
      nome: data.nome || '',
      cognome: data.cognome || '',
      ragioneSociale: data.ragioneSociale,
      codiceFiscale: data.codiceFiscale,
      partitaIva: data.partitaIva,
      indirizzo: data.indirizzo,
      cap: data.cap,
      citta: data.citta,
      provincia: data.provincia,
      nazione: data.nazione,
      telefono: data.telefono,
      cellulare: data.cellulare,
      email: data.email,
      pec: data.pec,
      sito: data.sito,
      codiceDestinatario: data.codiceDestinatario,
      iban: data.iban,
      banca: data.banca,
      agenzia: data.agenzia,
      swift: data.swift,
      note: data.note,
      attivo: data.attivo ?? true,
      cliente: data.cliente ?? false,
      fornitore: data.fornitore ?? false,
      vettore: data.vettore ?? false,
      agente: data.agente ?? false,
      dataCreazione: new Date().toISOString().split('T')[0],
      dataModifica: new Date().toISOString().split('T')[0],
    };

    return newContact;
  }

  async updateContact(id: number, data: Partial<Anagrafica>): Promise<Anagrafica | null> {
    // Simuliamo l'aggiornamento
    const updatedContact: Anagrafica = {
      id,
      nome: data.nome || '',
      cognome: data.cognome || '',
      ragioneSociale: data.ragioneSociale,
      codiceFiscale: data.codiceFiscale,
      partitaIva: data.partitaIva,
      indirizzo: data.indirizzo,
      cap: data.cap,
      citta: data.citta,
      provincia: data.provincia,
      nazione: data.nazione,
      telefono: data.telefono,
      cellulare: data.cellulare,
      email: data.email,
      pec: data.pec,
      sito: data.sito,
      codiceDestinatario: data.codiceDestinatario,
      iban: data.iban,
      banca: data.banca,
      agenzia: data.agenzia,
      swift: data.swift,
      note: data.note,
      attivo: data.attivo ?? true,
      cliente: data.cliente ?? false,
      fornitore: data.fornitore ?? false,
      vettore: data.vettore ?? false,
      agente: data.agente ?? false,
      dataCreazione: data.dataCreazione,
      dataModifica: new Date().toISOString().split('T')[0],
    };

    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    // Simuliamo l'eliminazione
    return true;
  }
}

export const contactsService = new ContactsService();