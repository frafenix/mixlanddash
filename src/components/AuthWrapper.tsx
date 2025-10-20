"use client";

import { useUser } from "@stackframe/stack";
import { useEffect } from "react";

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const user = useUser();

  useEffect(() => {
    console.log("[AuthWrapper] User state:", {
      user: user ? "authenticated" : "not authenticated",
      userId: user?.id,
      status: user === undefined ? "loading" : user ? "authenticated" : "not-authenticated"
    });
  }, [user]);

  // In development mode, check for mock authentication
  const isDevelopment = process.env.NODE_ENV === 'development';
  const mockRole = typeof window !== 'undefined' ? 
    document.cookie.split('; ').find(row => row.startsWith('mock_role='))?.split('=')[1] : null;

  // If in development and mock role is set, bypass Stack Auth
  if (isDevelopment && mockRole && ['admin', 'manager', 'user'].includes(mockRole)) {
    return <>{children}</>;
  }

  if (user === undefined) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Inizializzazione autenticazione...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}