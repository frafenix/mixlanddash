import 'dotenv/config';
import { db } from '../src/lib/db';
import { companies } from '../src/db/schema';

async function countDatabaseUsers() {
  try {
    console.log('Conteggio utenti nel database...');
    
    // Conta gli utenti nel database (tabella companies)
    const dbUsers = await db.query.companies.findMany();
    console.log(`\nUtenti che hanno completato l'onboarding (nel database): ${dbUsers.length}`);
    
    // Elenca gli utenti nel database
    console.log('\nDettagli utenti nel database:');
    dbUsers.forEach((company, index) => {
      console.log(`${index + 1}. UserID: ${company.userId}, Company: ${company.name}, Onboarding: ${company.onboardingCompleted ? 'Completato' : 'Non completato'}`);
    });
    
    return {
      databaseUsers: dbUsers.length
    };
  } catch (error) {
    console.error('Errore durante il conteggio degli utenti:', error);
    throw error;
  }
  // Nota: Drizzle ORM con Neon non richiede la chiusura esplicita della connessione
}

// Esegui la funzione
countDatabaseUsers()
  .then(result => {
    console.log('\nRiepilogo:');
    console.log('---------------------');
    console.log(`Utenti nel database (onboarding completato): ${result.databaseUsers}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Errore fatale:', error);
    process.exit(1);
  });