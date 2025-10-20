import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users, companies } from '../src/db/schema';
import { eq } from 'drizzle-orm';

// Carica le variabili d'ambiente
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function fixUserOnboardingFlag() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    console.log('🔧 CORREZIONE FLAG ONBOARDING UTENTE\n');

    // Trova tutti gli utenti con onboarding non completato
    const usersWithIncompleteOnboarding = await db
      .select()
      .from(users)
      .where(eq(users.onboardingCompleted, false));

    console.log(`📋 Trovati ${usersWithIncompleteOnboarding.length} utenti con onboarding incompleto.`);

    for (const user of usersWithIncompleteOnboarding) {
      console.log(`\n👤 Verifico utente: ${user.email} (ID: ${user.id})`);

      // Verifica se l'utente ha una company con onboarding completato
      const userCompanies = await db
        .select()
        .from(companies)
        .where(eq(companies.userId, user.id));

      console.log(`   🏢 Trovate ${userCompanies.length} companies per questo utente.`);

      const completedCompanies = userCompanies.filter(c => c.onboardingCompleted);
      
      if (completedCompanies.length > 0) {
        console.log(`   ✅ Trovate ${completedCompanies.length} companies con onboarding completato.`);
        console.log(`   🔄 Aggiorno il flag onboardingCompleted dell'utente...`);

        // Aggiorna il flag dell'utente
        await db
          .update(users)
          .set({ 
            onboardingCompleted: true,
            onboardingStarted: true
          })
          .where(eq(users.id, user.id));

        console.log(`   ✅ Flag aggiornato con successo per ${user.email}!`);
      } else {
        console.log(`   ⚠️  Nessuna company con onboarding completato trovata per ${user.email}.`);
      }
    }

    // Verifica finale
    console.log('\n📊 VERIFICA FINALE:');
    const updatedUsers = await db.select().from(users);
    updatedUsers.forEach(user => {
      console.log(`   👤 ${user.email}:`);
      console.log(`      Onboarding avviato: ${user.onboardingStarted ? 'Sì' : 'No'}`);
      console.log(`      Onboarding completato: ${user.onboardingCompleted ? 'Sì' : 'No'}`);
    });

    console.log('\n🎉 Correzione completata!');

  } catch (error) {
    console.error('❌ Errore durante la correzione:', error);
  }
}

fixUserOnboardingFlag();