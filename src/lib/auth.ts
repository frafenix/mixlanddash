import { db } from './db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { Role } from '@/db/schema';

// Mock authentication system per testing
export interface User {
  id: string;
  email: string;
  role: Role;
  onboardingCompleted: boolean;
}

// Simulazione dell'utente corrente (in produzione verrebbe da session/JWT)
let currentUser: User | null = null;

// Funzione per simulare il login con diversi utenti
export async function mockLogin(email: string): Promise<User | null> {
  try {
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user.length === 0) {
      console.error('Utente non trovato:', email);
      return null;
    }

    currentUser = {
      id: user[0].id,
      email: user[0].email,
      role: user[0].role,
      onboardingCompleted: user[0].onboardingCompleted ?? false,
    };

    console.log('🔐 Login simulato per:', currentUser);
    return currentUser;
  } catch (error) {
    console.error('Errore durante il login mock:', error);
    return null;
  }
}

// Funzione per ottenere l'utente corrente
export function getCurrentUser(): User | null {
  return currentUser;
}

// Funzione per logout
export function mockLogout(): void {
  currentUser = null;
  console.log('🚪 Logout effettuato');
}

// Funzione per verificare se l'utente è autenticato
export function isAuthenticated(): boolean {
  return currentUser !== null;
}

// Funzione per verificare il ruolo dell'utente
export function hasRole(role: Role): boolean {
  return currentUser?.role === role;
}

// Funzione per verificare se l'utente ha almeno un certo livello di ruolo
export function hasMinimumRole(minimumRole: Role): boolean {
  if (!currentUser) return false;
  
  const roleHierarchy = { user: 1, manager: 2, admin: 3 };
  return roleHierarchy[currentUser.role] >= roleHierarchy[minimumRole];
}

// Hook per React (da usare nei componenti)
export function useAuth() {
  return {
    user: getCurrentUser(),
    isAuthenticated: isAuthenticated(),
    hasRole,
    hasMinimumRole,
    mockLogin,
    mockLogout,
  };
}

// Funzioni di utilità per i test
export const TEST_USERS = {
  ADMIN: 'admin@test.com', // Questo sarà l'admin di default
  MANAGER: 'manager@test.com',
  USER: 'user@test.com',
} as const;