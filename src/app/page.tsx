"use client";

import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthWrapper from "@/components/AuthWrapper";
import { 
  mdiAccountMultiple, 
  mdiCalendarClock, 
  mdiChartLine, 
  mdiFileDocument, 
  mdiCog, 
  mdiShield,
  mdiCheck,
  mdiStar
} from "@mdi/js";
import Icon from "./_components/Icon";
import { createCheckoutSession } from "@/lib/stripe";

function HomePageContent() {
  const user = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    // Only redirect to dashboard if user is paid, not just logged in
    if (user && user.clientReadOnlyMetadata?.subscriptionStatus === 'paid' && !isProcessingPayment) {
      router.push("/dashboard");
      return;
    }

    // Check if user just registered and has pending purchase
    if (user && !isProcessingPayment) {
      const pendingPurchase = localStorage.getItem('pendingPurchase');
      if (pendingPurchase === 'starter') {
        console.log('🟡 User registered, starting checkout for pending purchase');
        localStorage.removeItem('pendingPurchase');
        handleStarterPlanClick();
      }
    }
  }, [user, router, isProcessingPayment]);

  const handleStarterPlanClick = async () => {
    console.log('🔵 handleStarterPlanClick called');
    console.log('🔵 User status:', {
      isLoggedIn: !!user,
      userId: user?.id,
      email: user?.primaryEmail,
      subscriptionStatus: user?.clientReadOnlyMetadata?.subscriptionStatus
    });
    
    if (!user) {
      console.log('🔴 User not logged in, redirecting to sign up with return URL');
      // Store the intent to purchase in localStorage
      localStorage.setItem('pendingPurchase', 'starter');
      // If user is not logged in, redirect to sign up
      router.push("/handler/sign-up?returnTo=checkout");
      return;
    }

    console.log('🟢 User is logged in, proceeding to checkout');
    try {
      console.log('🟡 Starting checkout process...');
      setIsLoading(true);
      setIsProcessingPayment(true);
      
      console.log('🟡 Calling createCheckoutSession with:', {
        priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'price_1SH4tPLRcbWydirwAEsKyQGE',
        userId: user.id,
        userEmail: user.primaryEmail || '',
      });
      
      await createCheckoutSession({
        priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'price_1SH4tPLRcbWydirwAEsKyQGE',
        userId: user.id,
        userEmail: user.primaryEmail || '',
      });
      
      console.log('🟢 createCheckoutSession completed successfully');
    } catch (error) {
      console.error('🔴 Error starting checkout:', error);
      alert('Errore durante l\'avvio del pagamento. Riprova più tardi.');
      setIsProcessingPayment(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (user === undefined) {
    // Ancora in caricamento
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Caricamento...</p>
        </div>
      </div>
    );
  }

  // Check if user has already paid - only redirect to dashboard if they have a subscription
  if (user && user.clientReadOnlyMetadata?.subscriptionStatus === 'paid') {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                HR Software
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-600 dark:text-gray-300">
                    Ciao, {user.displayName || user.primaryEmail}
                  </span>
                  <button
                    onClick={() => user.signOut()}
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a
                    href="/handler/sign-in"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Accedi
                  </a>
                  <a
                    href="/handler/sign-up"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-150"
                  >
                    Inizia Gratis
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Il Software HR All-in-One per la tua Azienda
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Gestisci presenze, ferie, buste paga e molto altro con un'unica piattaforma. 
            Semplifica i processi HR e concentrati su ciò che conta davvero.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/handler/sign-up"
              className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition duration-150"
            >
              Prova Gratuita
            </a>
            <a
              href="#features"
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-100 dark:hover:bg-slate-700 transition duration-150"
            >
              Scopri di più
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tutto quello che serve per gestire le Risorse Umane
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Una soluzione completa per semplificare tutti i processi HR
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon path={mdiCalendarClock} size="32" className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Gestione Presenze
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Traccia orari di lavoro, straordinari e pause con facilità. Sistema di timbratura digitale integrato.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon path={mdiAccountMultiple} size="32" className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Gestione Dipendenti
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Database completo dei dipendenti con documenti, contratti e informazioni personali.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon path={mdiFileDocument} size="32" className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ferie e Permessi
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Richieste e approvazioni automatizzate. Calendario condiviso per una migliore pianificazione.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-orange-100 dark:bg-orange-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon path={mdiChartLine} size="32" className="text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Report e Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Dashboard dettagliate con metriche HR, report personalizzabili e analisi dei dati.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-red-100 dark:bg-red-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon path={mdiCog} size="32" className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Automazione
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Workflow automatizzati per onboarding, valutazioni e processi ricorrenti.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-indigo-100 dark:bg-indigo-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon path={mdiShield} size="32" className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sicurezza e Privacy
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Conformità GDPR, crittografia dei dati e controlli di accesso avanzati.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Piani Semplici e Trasparenti
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Scegli il piano perfetto per la tua azienda
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-slate-700">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  €0
                  <span className="text-lg font-normal text-gray-600 dark:text-gray-300">/mese</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">Perfetto per iniziare</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-green-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Fino a 3 utenti</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-green-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Gestione presenze base</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-green-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Richieste ferie</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-green-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Report base</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-green-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Supporto email</span>
                </li>
              </ul>

              <a
                href="/handler/sign-up"
                className="w-full bg-gray-600 text-white py-3 px-6 rounded-md text-center font-medium hover:bg-gray-700 transition duration-150 block"
              >
                Inizia Gratis
              </a>
            </div>

            {/* Starter Plan */}
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                  <Icon path={mdiStar} size="16" className="mr-1" />
                  Più Popolare
                </span>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Starter</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  €9,90
                  <span className="text-lg font-normal text-gray-600 dark:text-gray-300">/mese</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">Per aziende in crescita</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-green-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Fino a 30 utenti</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-green-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Gestione presenze avanzata</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-green-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Workflow automatizzati</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-green-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Report personalizzati</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-green-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Integrazioni API</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-green-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Supporto prioritario</span>
                </li>
              </ul>

              <button
                onClick={handleStarterPlanClick}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md text-center font-medium hover:bg-blue-700 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Caricamento...' : 'Inizia con Starter'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto a Trasformare la tua Gestione HR?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Unisciti a migliaia di aziende che hanno già semplificato i loro processi HR con la nostra piattaforma.
          </p>
          <a
            href="/handler/sign-up"
            className="bg-white text-blue-600 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-100 transition duration-150 inline-block"
          >
            Inizia la Prova Gratuita
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">HR Software</h3>
            <p className="text-gray-400 mb-8">
              La soluzione completa per la gestione delle risorse umane
            </p>
            <div className="flex justify-center space-x-8">
              <a href="#" className="text-gray-400 hover:text-white transition duration-150">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-150">
                Termini di Servizio
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-150">
                Contatti
              </a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-400">
                © 2024 HR Software. Tutti i diritti riservati.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthWrapper>
      <HomePageContent />
    </AuthWrapper>
  );
}
