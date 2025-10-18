import * as dotenv from 'dotenv';
// Carica esplicitamente le variabili d'ambiente da .env.local
dotenv.config({ path: '.env.local' });

// Imposta manualmente le variabili d'ambiente PRIMA di importare stackServerApp
process.env.NEXT_PUBLIC_STACK_PROJECT_ID = '2d734cc7-ea87-4935-902b-5a4d858636aa';
process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY = 'pk_live_2d734cc7-ea87-4935-902b-5a4d858636aa_5a4d858636aa';
process.env.STACK_SECRET_SERVER_KEY = 'sk_live_2d734cc7-ea87-4935-902b-5a4d858636aa_5a4d858636aa';

// Importa stackServerApp dopo aver impostato le variabili d'ambiente
import { StackServerApp } from "@stackframe/stack";

// Crea una nuova istanza di StackServerApp con le credenziali impostate
const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY,
});

async function deleteAllUsers() {
  try {
    console.log('Inizializzazione eliminazione utenti da Stack Auth...');
    
    // Ottieni tutti gli utenti da Stack Auth
    const stackUsers = await stackServerApp.listUsers();
    console.log(`Trovati ${stackUsers.length} utenti in Stack Auth`);
    
    if (stackUsers.length === 0) {
      console.log('Nessun utente da eliminare.');
      return;
    }
    
    console.log('\nElenco utenti che verranno eliminati:');
    stackUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Email: ${user.primaryEmail || 'N/A'}`);
    });
    
    // Chiedi conferma prima di procedere
    console.log('\n⚠️ ATTENZIONE: Stai per eliminare TUTTI gli utenti. Questa operazione è IRREVERSIBILE.');
    console.log('Per procedere, digita "ELIMINA" e premi Invio:');
    
    // Leggi l'input dell'utente
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('', async (answer: string) => {
      if (answer.trim() === 'ELIMINA') {
        console.log('\nEliminazione utenti in corso...');
        
        let eliminati = 0;
        let errori = 0;
        
        // Elimina gli utenti uno per uno
        for (const user of stackUsers) {
          try {
            await stackServerApp.deleteUser(user.id);
            console.log(`✅ Utente eliminato: ${user.primaryEmail || user.id}`);
            eliminati++;
          } catch (error) {
            console.error(`❌ Errore nell'eliminazione dell'utente ${user.primaryEmail || user.id}:`, error);
            errori++;
          }
        }
        
        console.log('\nOperazione completata.');
        console.log(`Utenti eliminati con successo: ${eliminati}`);
        if (errori > 0) {
          console.log(`Utenti non eliminati a causa di errori: ${errori}`);
        }
        
        // Verifica finale
        try {
          const rimanenti = await stackServerApp.listUsers();
          console.log(`\nUtenti rimanenti in Stack Auth: ${rimanenti.length}`);
        } catch (error) {
          console.error('Errore nel conteggio degli utenti rimanenti:', error);
        }
        
        readline.close();
        process.exit(0);
      } else {
        console.log('Operazione annullata.');
        readline.close();
        process.exit(0);
      }
    });
    
  } catch (error) {
    console.error('Errore durante l\'eliminazione degli utenti:', error);
    process.exit(1);
  }
}

// Esegui la funzione
deleteAllUsers();