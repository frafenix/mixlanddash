import { db } from '../src/lib/db';
import { companies } from '../src/db/schema';

async function getRegisteredUsers() {
  try {
    console.log('Interrogazione del database per gli utenti registrati...');
    
    // Query per ottenere tutte le aziende (e quindi gli utenti associati)
    const registeredCompanies = await db.select().from(companies);
    
    console.log('Utenti registrati:');
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
      
      console.log(`Totale utenti registrati: ${registeredCompanies.length}`);
    }
  } catch (error) {
    console.error('Errore durante l\'interrogazione del database:', error);
  } finally {
    process.exit(0);
  }
}

// Esegui la funzione
getRegisteredUsers();