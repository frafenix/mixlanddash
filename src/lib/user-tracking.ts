import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ensureFirstUserIsAdmin } from '@/lib/auth-helpers';

export async function saveUserToDatabase(stackUser: any) {
  try {
    console.log('🔄 [UserTracking] Saving user to database:', {
      id: stackUser.id,
      email: stackUser.primaryEmail,
    });

    // Verifica se l'utente esiste già
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, stackUser.id))
      .limit(1);

    if (existingUser.length > 0) {
      // Aggiorna lastLoginAt
      await db
        .update(users)
        .set({
          lastLoginAt: new Date(),
        })
        .where(eq(users.id, stackUser.id));

      console.log('✅ [UserTracking] Updated existing user login time');
      return existingUser[0];
    } else {
      // Crea nuovo utente
      const [newUser] = await db
        .insert(users)
        .values({
          id: stackUser.id,
          email: stackUser.primaryEmail,
          lastLoginAt: new Date(),
          // role: 'user' è il default nello schema
        })
        .returning();

      console.log('✅ [UserTracking] Created new user in database');

      // Verifica se questo è il primo utente e promuovilo ad admin
      await ensureFirstUserIsAdmin(stackUser.id);

      return newUser;
    }
  } catch (error) {
    console.error('❌ [UserTracking] Error saving user to database:', error);
    throw error;
  }
}