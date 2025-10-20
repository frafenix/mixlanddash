'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/rbac';
import type { Role } from '@/db/schema';
import type { Permission } from '@/lib/rbac';

interface RoleBasedAccessProps {
  children: ReactNode;
  allowedRoles?: Role[];
  requiredPermission?: Permission;
  fallback?: ReactNode;
  minimumRole?: Role;
}

export function RoleBasedAccess({
  children,
  allowedRoles,
  requiredPermission,
  fallback = null,
  minimumRole,
}: RoleBasedAccessProps) {
  const { user, hasRole, hasMinimumRole } = useAuth();

  // Se l'utente non è autenticato, non mostra nulla
  if (!user) {
    return <>{fallback}</>;
  }

  // Controllo per ruoli specifici
  if (allowedRoles && !allowedRoles.some(role => hasRole(role))) {
    return <>{fallback}</>;
  }

  // Controllo per ruolo minimo
  if (minimumRole && !hasMinimumRole(minimumRole)) {
    return <>{fallback}</>;
  }

  // Controllo per permission specifica
  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Componenti di utilità per casi comuni
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function ManagerOrAdmin({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['manager', 'admin']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function UserOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['user']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

// Hook per controlli condizionali nei componenti
export function useRoleAccess() {
  const { user } = useAuth();
  
  return {
    canCreate: (resource: string) => 
      user ? hasPermission(user.role, `${resource}:create` as Permission) : false,
    canRead: (resource: string) => 
      user ? hasPermission(user.role, `${resource}:read` as Permission) : false,
    canUpdate: (resource: string) => 
      user ? hasPermission(user.role, `${resource}:update` as Permission) : false,
    canDelete: (resource: string) => 
      user ? hasPermission(user.role, `${resource}:delete` as Permission) : false,
    canApprove: (resource: string) => 
      user ? hasPermission(user.role, `${resource}:approve` as Permission) : false,
    canReject: (resource: string) => 
      user ? hasPermission(user.role, `${resource}:reject` as Permission) : false,
  };
}