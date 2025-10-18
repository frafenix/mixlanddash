import * as dotenv from 'dotenv';
// Carica esplicitamente le variabili d'ambiente da .env.local
dotenv.config({ path: '.env.local' });

import { db } from '../src/lib/db';
import { users } from '../src/db/schema';
import { stackServerApp } from '../src/lib/stack';

async function importUsers() {
  try {
    console.log('Inizializzazione importazione utenti da Stack Auth...');
    
    // Ottieni tutti gli utenti da Stack Auth
    const stackUsers = await stackServerApp.listUsers();
    console.log(`Trovati ${stackUsers.length} utenti in Stack Auth`);
    
    // Conta quanti utenti sono già nel database
    const existingUsers = await db.query.users.findMany();
    console.log(`Utenti già presenti nel database: ${existingUsers.length}`);
    
    // Importa gli utenti che non sono già nel database
    let importedCount = 0;
    for (const stackUser of stackUsers) {
      // Verifica se l'utente esiste già
      const exists = existingUsers.some(u => u.id === stackUser.id);
      
      if (!exists) {
        // Inserisci il nuovo utente
        await db.insert(users).values({
          id: stackUser.id,
          email: stackUser.primaryEmail || '',
          createdAt: new Date(),
          onboardingStarted: false,
          onboardingCompleted: false,
          metadata: { source: 'stack_auth_import' }
        });
        importedCount++;
      }
    }
    
    console.log(`Importati ${importedCount} nuovi utenti`);
    console.log(`Totale utenti nel database dopo l'importazione: ${existingUsers.length + importedCount}`);
    
    return {
      totalStackAuthUsers: stackUsers.length,
      previousDatabaseUsers: existingUsers.length,
      newlyImported: importedCount,
      totalAfterImport: existingUsers.length + importedCount
    };
  } catch (error) {
    console.error('Errore durante l\'importazione degli utenti:', error);
    throw error;
  }
  // Nota: Drizzle ORM con Neon non richiede la chiusura esplicita della connessione
}

// Esegui la funzione di importazione
importUsers()
  .then(result => {
    console.log('Riepilogo importazione:');
    console.log('---------------------');
    console.log(`Utenti totali in Stack Auth: ${result.totalStackAuthUsers}`);
    console.log(`Utenti già presenti nel database: ${result.previousDatabaseUsers}`);
    console.log(`Nuovi utenti importati: ${result.newlyImported}`);
    console.log(`Totale utenti nel database dopo l'importazione: ${result.totalAfterImport}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Errore fatale:', error);
    process.exit(1);
  });