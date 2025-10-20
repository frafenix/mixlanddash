import dynamic from "next/dynamic";
import { Suspense } from "react";
import ClientOnlyWrapper from "@/components/ClientOnlyWrapper";

// Importazione semplice senza opzioni SSR
const HomePageContent = dynamic(() => import("./HomePageContent"), {
  loading: () => <LoadingScreen />
});

// Componente di caricamento
function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Caricamento in corso...</h1>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ClientOnlyWrapper fallback={<LoadingScreen />}>
      <HomePageContent />
    </ClientOnlyWrapper>
  );
}
