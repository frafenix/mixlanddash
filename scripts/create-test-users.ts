import { db } from '../src/lib/db';
import { users, companies } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function createTestUsers() {
  try {
    console.log('🚀 Creazione utenti di test...');

    // Creo utente con ruolo USER
    const testUser = await db.insert(users).values({
      id: 'test-user-001',
      email: 'user@test.com',
      role: 'user',
      onboardingStarted: true,
      onboardingCompleted: true,
    }).returning();

    console.log('✅ Utente USER creato:', testUser[0]);

    // Creo utente con ruolo MANAGER
    const testManager = await db.insert(users).values({
      id: 'test-manager-001',
      email: 'manager@test.com',
      role: 'manager',
      onboardingStarted: true,
      onboardingCompleted: true,
    }).returning();

    console.log('✅ Utente MANAGER creato:', testManager[0]);

    // Creo una company per l'utente USER
    const userCompany = await db.insert(companies).values({
      userId: 'test-user-001',
      name: 'Test Company User',
      onboardingCompleted: true,
    }).returning();

    console.log('✅ Company per USER creata:', userCompany[0]);

    // Creo una company per l'utente MANAGER
    const managerCompany = await db.insert(companies).values({
      userId: 'test-manager-001',
      name: 'Test Company Manager',
      onboardingCompleted: true,
    }).returning();

    console.log('✅ Company per MANAGER creata:', managerCompany[0]);

    console.log('\n🎉 Utenti di test creati con successo!');
    console.log('📧 USER: user@test.com (ID: test-user-001)');
    console.log('📧 MANAGER: manager@test.com (ID: test-manager-001)');
    console.log('\n💡 Nota: Questi utenti hanno onboarding completato e possono accedere al dashboard.');

  } catch (error) {
    console.error('❌ Errore durante la creazione degli utenti di test:', error);
  } finally {
    process.exit(0);
  }
}

createTestUsers();