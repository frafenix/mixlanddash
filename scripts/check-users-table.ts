import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users } from '../src/db/schema';
import { count } from 'drizzle-orm';

// Carica le variabili d'ambiente
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkUsersTable() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    // Conta il numero totale di utenti
    const userCount = await db.select({ count: count() }).from(users);
    console.log(`📊 Numero totale di utenti nella tabella: ${userCount[0].count}`);

    // Mostra tutti gli utenti
    const allUsers = await db.select().from(users);
    console.log('\n👥 Utenti nella tabella:');
    
    if (allUsers.length === 0) {
      console.log('   Nessun utente trovato nella tabella.');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Creato: ${user.createdAt}`);
        console.log(`      Ultimo login: ${user.lastLoginAt || 'Mai'}`);
        console.log(`      Onboarding completato: ${user.onboardingCompleted ? 'Sì' : 'No'}`);
        console.log(`      Piano: ${user.subscriptionPlan || 'Nessuno'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Errore durante la verifica della tabella users:', error);
  }
}

checkUsersTable();