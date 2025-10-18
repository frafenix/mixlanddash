import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users, companies, locations, teams } from '../src/db/schema';
import { count } from 'drizzle-orm';

// Carica le variabili d'ambiente
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkAllTables() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const db = drizzle(sql);

    console.log('🔍 VERIFICA COMPLETA DELLO STATO ONBOARDING\n');

    // Verifica tabella users
    console.log('👥 TABELLA USERS:');
    const allUsers = await db.select().from(users);
    if (allUsers.length === 0) {
      console.log('   Nessun utente trovato.');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Creato: ${user.createdAt}`);
        console.log(`      Ultimo login: ${user.lastLoginAt || 'Mai'}`);
        console.log(`      Onboarding avviato: ${user.onboardingStarted ? 'Sì' : 'No'}`);
        console.log(`      Onboarding completato: ${user.onboardingCompleted ? 'Sì' : 'No'}`);
        console.log(`      Piano: ${user.subscriptionPlan || 'Nessuno'}`);
        console.log('');
      });
    }

    // Verifica tabella companies
    console.log('🏢 TABELLA COMPANIES:');
    const allCompanies = await db.select().from(companies);
    if (allCompanies.length === 0) {
      console.log('   Nessuna azienda trovata.');
    } else {
      allCompanies.forEach((company, index) => {
        console.log(`   ${index + 1}. ID: ${company.id}`);
        console.log(`      User ID: ${company.userId}`);
        console.log(`      Nome: ${company.name}`);
        console.log(`      Onboarding completato: ${company.onboardingCompleted ? 'Sì' : 'No'}`);
        console.log(`      Creato: ${company.createdAt}`);
        console.log(`      Aggiornato: ${company.updatedAt}`);
        console.log('');
      });
    }

    // Verifica tabella locations
    console.log('📍 TABELLA LOCATIONS:');
    const allLocations = await db.select().from(locations);
    if (allLocations.length === 0) {
      console.log('   Nessuna location trovata.');
    } else {
      allLocations.forEach((location, index) => {
        console.log(`   ${index + 1}. ID: ${location.id}`);
        console.log(`      Company ID: ${location.companyId}`);
        console.log(`      Indirizzo: ${location.address}`);
        console.log(`      Città: ${location.city || 'Non specificata'}`);
        console.log(`      Paese: ${location.country || 'Non specificato'}`);
        console.log(`      CAP: ${location.zipCode || 'Non specificato'}`);
        console.log(`      Creato: ${location.createdAt}`);
        console.log('');
      });
    }

    // Verifica tabella teams
    console.log('👥 TABELLA TEAMS:');
    const allTeams = await db.select().from(teams);
    if (allTeams.length === 0) {
      console.log('   Nessun team trovato.');
    } else {
      allTeams.forEach((team, index) => {
        console.log(`   ${index + 1}. ID: ${team.id}`);
        console.log(`      Company ID: ${team.companyId}`);
        console.log(`      Nome: ${team.name}`);
        console.log(`      Creato: ${team.createdAt}`);
        console.log(`      Aggiornato: ${team.updatedAt}`);
        console.log('');
      });
    }

    // Riepilogo
    console.log('📊 RIEPILOGO:');
    console.log(`   Users: ${allUsers.length}`);
    console.log(`   Companies: ${allCompanies.length}`);
    console.log(`   Locations: ${allLocations.length}`);
    console.log(`   Teams: ${allTeams.length}`);

    // Verifica coerenza onboarding
    if (allUsers.length > 0 && allCompanies.length > 0) {
      const user = allUsers[0];
      const company = allCompanies[0];
      
      console.log('\n✅ ANALISI ONBOARDING:');
      console.log(`   User onboarding completato: ${user.onboardingCompleted ? 'Sì' : 'No'}`);
      console.log(`   Company onboarding completato: ${company.onboardingCompleted ? 'Sì' : 'No'}`);
      
      if (company.onboardingCompleted && !user.onboardingCompleted) {
        console.log('   ⚠️  INCONSISTENZA: La company ha completato l\'onboarding ma l\'user no!');
        console.log('   🔧 Potrebbe essere necessario aggiornare il flag dell\'user.');
      } else if (company.onboardingCompleted && user.onboardingCompleted) {
        console.log('   ✅ TUTTO OK: Onboarding completato correttamente per entrambi.');
      }
    }

  } catch (error) {
    console.error('❌ Errore durante la verifica delle tabelle:', error);
  }
}

checkAllTables();