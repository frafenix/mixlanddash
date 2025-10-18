"use client";

import { useEffect, useState } from "react";

interface ClientOnlyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ClientOnlyWrapper({ children, fallback }: ClientOnlyWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Caricamento...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}