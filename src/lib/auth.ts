import type { Role } from '@/db/schema';

// Mock authentication system per testing
export interface User {
  id: string;
  email: string;
  role: Role;
  onboardingCompleted: boolean;
}

// Chiave per localStorage
const AUTH_STORAGE_KEY = 'mock_auth_user';

// Simulazione dell'utente corrente (in produzione verrebbe da session/JWT)
let currentUser: User | null = null;

// Funzione per caricare l'utente da localStorage
function loadUserFromStorage(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Errore nel caricamento utente da localStorage:', error);
  }
  return null;
}

// Funzione per salvare l'utente in localStorage
function saveUserToStorage(user: User | null): void {
  if (typeof window === 'undefined') return;
  
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Errore nel salvataggio utente in localStorage:', error);
  }
}

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
      email,
      role,
      onboardingCompleted: true,
    };

    // Salva l'utente in localStorage
    saveUserToStorage(currentUser);

    console.log('🔐 Login simulato (senza DB) per:', currentUser);
    return currentUser;
  } catch (error) {
    console.error('Errore durante il login mock:', error);
    return null;
  }
}

// Funzione per ottenere l'utente corrente
export function getCurrentUser(): User | null {
  // Se non abbiamo un utente in memoria, prova a caricarlo da localStorage
  if (!currentUser) {
    currentUser = loadUserFromStorage();
  }
  return currentUser;
}

// Funzione per logout
export function mockLogout(): void {
  currentUser = null;
  saveUserToStorage(null);
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