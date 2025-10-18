import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Salva o aggiorna un utente nel database
 * Questa funzione viene chiamata quando un utente si registra o effettua il login
 */
export async function saveUserToDatabase(user: { id: string; primaryEmail?: string; }) {
  if (!user?.id) return null;
  
  try {
    // Verifica se l'utente esiste già
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, user.id)
    });
    
    if (!existingUser) {
      // Crea nuovo record utente
      await db.insert(users).values({
        id: user.id,
        email: user.primaryEmail || '',
        createdAt: new Date(),
        metadata: { source: 'registration' }
      });
      
      console.log(`Nuovo utente salvato nel database: ${user.id}`);
      return true;
    } else {
      // Aggiorna l'ultimo accesso
      await db.update(users)
        .set({ 
          lastLoginAt: new Date() 
        })
        .where(eq(users.id, user.id));
      
      return false;
    }
  } catch (error) {
    console.error('Errore nel salvataggio utente:', error);
    return null;
  }
}