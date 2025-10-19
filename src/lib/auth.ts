import type { Role } from '@/db/schema';

// Mock authentication system per testing
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  onboardingCompleted: boolean;
}

// Simulazione dell'utente corrente (in produzione verrebbe da session/JWT)
let currentUser: User | null = null;

// Funzione per simulare il login con diversi utenti SENZA accesso al DB
export async function mockLogin(email: string): Promise<User | null> {
  try {
    // Mappa email -> ruolo simulato
    const roleByEmail: Record<string, Role> = {
      'admin@test.com': 'admin',
      'manager@test.com': 'manager',
      'user@test.com': 'user',
    };

    const role = roleByEmail[email] ?? 'user';

    currentUser = {
      id: Math.random().toString(36).slice(2),
      name: email.split('@')[0], // Simple name generation
      email,
      role,
      onboardingCompleted: true,
    };

    console.log('🔐 Login simulato (senza DB) per:', currentUser);
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
export const TEST_USERS: Record<string, User> = {
  ADMIN: {
    id: 'admin-user-id',
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'admin',
    onboardingCompleted: true,
  },
  MANAGER: {
    id: 'manager-user-id',
    name: 'Manager User',
    email: 'manager@test.com',
    role: 'manager',
    onboardingCompleted: true,
  },
  USER: {
    id: 'regular-user-id',
    name: 'Regular User',
    email: 'user@test.com',
    role: 'user',
    onboardingCompleted: true,
  },
};