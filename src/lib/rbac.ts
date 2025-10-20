import { Role } from '@/db/schema';

// Definizione delle permissions per ogni ruolo
export const PERMISSIONS = {
  // Admin permissions - accesso completo
  admin: [
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'users:invite',
    'teams:create',
    'teams:read',
    'teams:update',
    'teams:delete',
    'teams:manage_members',
    'companies:create',
    'companies:read',
    'companies:update',
    'companies:delete',
    'invitations:create',
    'invitations:read',
    'invitations:revoke',
    'attendances:create',
    'attendances:read',
    'attendances:update',
    'attendances:delete',
    'attendances:approve',
    'attendances:reject',
    'holidays:create',
    'holidays:read',
    'holidays:update',
    'holidays:delete',
    'holidays:approve',
    'holidays:reject',
    'dashboard:admin',
  ],
  
  // Manager permissions - gestione team e utenti limitata
  manager: [
    'users:read',
    'users:update', // solo propri dati
    'teams:read',
    'teams:update', // solo team assegnati
    'teams:manage_members', // solo team assegnati
    'companies:read',
    'attendances:read', // può vedere presenze del team
    'attendances:approve', // può approvare presenze
    'attendances:reject', // può rifiutare presenze
    'holidays:read', // può vedere ferie del team
    'holidays:approve', // può approvare ferie
    'holidays:reject', // può rifiutare ferie
    'dashboard:manager',
  ],
  
  // User permissions - accesso base
  user: [
    'users:read', // solo propri dati
    'users:update', // solo propri dati
    'teams:read', // solo team di appartenenza
    'companies:read', // solo propria company
    'attendances:create', // può creare proprie presenze
    'attendances:read', // solo proprie presenze
    'attendances:update', // solo proprie presenze
    'holidays:create', // può creare proprie ferie
    'holidays:read', // solo proprie ferie
    'holidays:update', // solo proprie ferie
    'dashboard:user',
  ],
} as const;

// Tipo per le permissions - unione di tutte le permissions possibili
type AdminPermissions = typeof PERMISSIONS.admin[number];
type ManagerPermissions = typeof PERMISSIONS.manager[number];
type UserPermissions = typeof PERMISSIONS.user[number];

export type Permission = AdminPermissions | ManagerPermissions | UserPermissions;

// Funzione per verificare se un ruolo ha una specifica permission
export function hasPermission(userRole: Role, permission: Permission): boolean {
  const rolePermissions = PERMISSIONS[userRole] as readonly Permission[];
  return rolePermissions.includes(permission);
}

// Funzione per verificare se un ruolo può accedere a una risorsa
export function canAccessResource(userRole: Role, resource: string, action: string): boolean {
  const permission = `${resource}:${action}` as Permission;
  return hasPermission(userRole, permission);
}

// Gerarchia dei ruoli (per controlli di elevazione)
export const ROLE_HIERARCHY: Record<Role, number> = {
  user: 1,
  manager: 2,
  admin: 3,
};

// Funzione per verificare se un ruolo può gestire un altro ruolo
export function canManageRole(managerRole: Role, targetRole: Role): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

// Middleware per controllo permissions
export function requirePermission(permission: Permission) {
  return (userRole: Role) => {
    if (!hasPermission(userRole, permission)) {
      throw new Error(`Access denied. Required permission: ${permission}`);
    }
    return true;
  };
}

// Funzione per ottenere tutte le permissions di un ruolo
export function getRolePermissions(role: Role): readonly Permission[] {
  return PERMISSIONS[role];
}