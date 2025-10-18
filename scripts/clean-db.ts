import { db } from '../src/lib/db';
import { companies, locations, teams } from '../src/db/schema';
import dotenv from 'dotenv';

// Carica le variabili d'ambiente da .env.local
dotenv.config({ path: '.env.local' });

async function cleanDatabase() {
  console.log('Iniziando la pulizia del database...');

  try {
    // Elimina prima i record dalle tabelle figlie (locations e teams)
    // Anche se c'è onDelete: 'cascade', è meglio essere espliciti
    console.log('Eliminazione dei record dalla tabella locations...');
    const deletedLocations = await db.delete(locations).returning();
    console.log(`Eliminati ${deletedLocations.length} record dalla tabella locations`);

    console.log('Eliminazione dei record dalla tabella teams...');
    const deletedTeams = await db.delete(teams).returning();
    console.log(`Eliminati ${deletedTeams.length} record dalla tabella teams`);

    // Infine, elimina i record dalla tabella companies
    console.log('Eliminazione dei record dalla tabella companies...');
    const deletedCompanies = await db.delete(companies).returning();
    console.log(`Eliminati ${deletedCompanies.length} record dalla tabella companies`);

    console.log('Pulizia del database completata con successo!');
    
    // Riepilogo
    console.log('\nRiepilogo pulizia:');
    console.log('---------------------');
    console.log(`Locations eliminate: ${deletedLocations.length}`);
    console.log(`Teams eliminati: ${deletedTeams.length}`);
    console.log(`Companies eliminate: ${deletedCompanies.length}`);
    console.log('---------------------');
    
  } catch (error) {
    console.error('Errore durante la pulizia del database:', error);
    process.exit(1);
  }
}

// Esegui la funzione
cleanDatabase();