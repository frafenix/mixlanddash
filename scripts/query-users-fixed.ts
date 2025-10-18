import { config } from 'dotenv';
import { resolve } from 'path';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { companies } from '../src/db/schema';

// Carica le variabili d'ambiente dal file .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function getRegisteredUsers() {
  try {
    console.log('Configurazione database...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL non trovato nel file .env.local');
    }
    
    console.log('Connessione al database Neon...');
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql, { schema: { companies } });
    
    console.log('Interrogazione del database per gli utenti registrati...');
    
    // Query per ottenere tutte le aziende (e quindi gli utenti associati)
    const registeredCompanies = await db.select().from(companies);
    
    console.log('\nUtenti registrati:');
    console.log('------------------');
    
    if (registeredCompanies.length === 0) {
      console.log('Nessun utente registrato trovato nel database.');
    } else {
      registeredCompanies.forEach((company, index) => {
        console.log(`${index + 1}. User ID: ${company.userId}`);
        console.log(`   Nome azienda: ${company.name}`);
        console.log(`   Onboarding completato: ${company.onboardingCompleted ? 'Sì' : 'No'}`);
        console.log(`   Data creazione: ${company.createdAt}`);
        console.log('------------------');
      });
      
      console.log(`\nTotale utenti registrati: ${registeredCompanies.length}`);
    }
  } catch (error) {
    console.error('Errore durante l\'interrogazione del database:', error);
  } finally {
    process.exit(0);
  }
}

// Esegui la funzione
getRegisteredUsers();