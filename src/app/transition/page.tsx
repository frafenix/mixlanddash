"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";

export default function TransitionPage() {
  const router = useRouter();
  const currentUser = useUser();
  // The currentUser object is the user itself, not containing a nested user property
  const isLoading = false; // Stack Auth handles loading state internally

  useEffect(() => {
    // Redirect to appropriate page once user data is loaded
    if (currentUser) {
      router.push("/onboarding");
    } else {
      router.push("/handler/sign-in");
    }
  }, [currentUser, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Caricamento in corso...</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Ti stiamo reindirizzando alla pagina corretta.</p>
      </div>
    </div>
  );
}