import { db } from '@/lib/db';
import { users, type Role } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { hasPermission, type Permission } from '@/lib/rbac';

// Interfaccia per i dati utente con ruolo
export interface UserWithRole {
  id: string;
  email: string;
  role: Role;
  createdAt: Date;
  lastLoginAt: Date | null;
  onboardingCompleted: boolean | null; // Può essere null nel database
}

// Ottieni utente con ruolo dal database
export async function getUserWithRole(userId: string): Promise<UserWithRole | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user || null;
}

// Verifica se un utente ha una specifica permission
export async function userHasPermission(userId: string, permission: Permission): Promise<boolean> {
  const user = await getUserWithRole(userId);
  if (!user) return false;
  
  return hasPermission(user.role, permission);
}

// Verifica se un utente può accedere a una risorsa
export async function userCanAccessResource(
  userId: string, 
  resource: string, 
  action: string
): Promise<boolean> {
  const permission = `${resource}:${action}` as Permission;
  return await userHasPermission(userId, permission);
}

// Auto-promozione del primo utente registrato ad admin
export async function ensureFirstUserIsAdmin(userId: string): Promise<boolean> {
  // Conta il numero totale di utenti
  const [userCountResult] = await db
    .select({ count: count() })
    .from(users);

  const totalUsers = userCountResult.count;

  // Se questo è il primo utente, promuovilo ad admin
  if (totalUsers === 1) {
    await db
      .update(users)
      .set({ role: 'admin' })
      .where(eq(users.id, userId));
    
    console.log(`🔑 First user ${userId} promoted to admin`);
    return true;
  }

  return false;
}

// Middleware per verificare ruoli (da usare nelle API routes)
export function requireRole(requiredRole: Role) {
  return async (userId: string) => {
    const user = await getUserWithRole(userId);
    
    if (!user) {
      throw new Error('Utente non trovato');
    }

    // Verifica gerarchia ruoli
    const roleHierarchy: Record<Role, number> = {
      user: 1,
      manager: 2,
      admin: 3,
    };

    if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
      throw new Error(`Accesso negato. Ruolo richiesto: ${requiredRole}`);
    }

    return user;
  };
}

// Middleware per verificare permissions specifiche
export function requirePermission(permission: Permission) {
  return async (userId: string) => {
    const hasAccess = await userHasPermission(userId, permission);
    
    if (!hasAccess) {
      throw new Error(`Accesso negato. Permission richiesta: ${permission}`);
    }

    return await getUserWithRole(userId);
  };
}

// Verifica se un utente è admin
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await getUserWithRole(userId);
  return user?.role === 'admin' || false;
}

// Verifica se un utente è manager o admin
export async function isManagerOrAdmin(userId: string): Promise<boolean> {
  const user = await getUserWithRole(userId);
  return user?.role === 'manager' || user?.role === 'admin' || false;
}

// Ottieni tutti gli admin del sistema
export async function getSystemAdmins(): Promise<UserWithRole[]> {
  return await db
    .select()
    .from(users)
    .where(eq(users.role, 'admin'));
}

// Aggiorna il ruolo di un utente (solo admin possono farlo)
export async function updateUserRole(
  adminId: string, 
  targetUserId: string, 
  newRole: Role
): Promise<void> {
  // Verifica che chi fa la richiesta sia admin
  const admin = await getUserWithRole(adminId);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Solo gli admin possono modificare i ruoli');
  }

  // Verifica che l'utente target esista
  const targetUser = await getUserWithRole(targetUserId);
  if (!targetUser) {
    throw new Error('Utente target non trovato');
  }

  // Non permettere di rimuovere l'ultimo admin
  if (targetUser.role === 'admin' && newRole !== 'admin') {
    const adminCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, 'admin'));
    
    if (adminCount[0].count <= 1) {
      throw new Error('Non è possibile rimuovere l\'ultimo admin del sistema');
    }
  }

  // Aggiorna il ruolo
  await db
    .update(users)
    .set({ role: newRole })
    .where(eq(users.id, targetUserId));
}