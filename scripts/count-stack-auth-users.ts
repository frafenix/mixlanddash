import 'dotenv/config';
import { stackServerApp } from '../src/lib/stack';
import { db } from '../src/lib/db';
import { companies } from '../src/db/schema';

async function countUsers() {
  try {
    console.log('Conteggio utenti in Stack Auth e nel database...');
    
    // Ottieni tutti gli utenti da Stack Auth
    const stackUsers = await stackServerApp.listUsers();
    console.log(`Utenti totali in Stack Auth: ${stackUsers.length}`);
    
    // Elenca gli ID degli utenti
    console.log('\nDettagli utenti in Stack Auth:');
    stackUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Email: ${user.primaryEmail || 'N/A'}`);
    });
    
    // Conta gli utenti nel database (tabella companies)
    const dbUsers = await db.query.companies.findMany();
    console.log(`\nUtenti che hanno completato l'onboarding (nel database): ${dbUsers.length}`);
    
    // Elenca gli utenti nel database
    console.log('\nDettagli utenti nel database:');
    dbUsers.forEach((company, index) => {
      console.log(`${index + 1}. UserID: ${company.userId}, Company: ${company.name}, Onboarding: ${company.onboardingCompleted ? 'Completato' : 'Non completato'}`);
    });
    
    // Calcola la percentuale di conversione
    const conversionRate = (dbUsers.length / stackUsers.length) * 100;
    console.log(`\nTasso di conversione: ${conversionRate.toFixed(2)}%`);
    
    return {
      stackAuthUsers: stackUsers.length,
      databaseUsers: dbUsers.length,
      conversionRate: conversionRate
    };
  } catch (error) {
    console.error('Errore durante il conteggio degli utenti:', error);
    throw error;
  }
  // Nota: Drizzle ORM con Neon non richiede la chiusura esplicita della connessione
}

// Esegui la funzione
countUsers()
  .then(result => {
    console.log('\nRiepilogo:');
    console.log('---------------------');
    console.log(`Utenti totali in Stack Auth: ${result.stackAuthUsers}`);
    console.log(`Utenti nel database (onboarding completato): ${result.databaseUsers}`);
    console.log(`Tasso di conversione: ${result.conversionRate.toFixed(2)}%`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Errore fatale:', error);
    process.exit(1);
  });