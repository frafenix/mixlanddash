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
  mdiStar,
  mdiWeatherSunny,
  mdiWeatherNight,
  mdiAccount
} from "@mdi/js";
import Icon from "./_components/Icon";
import { createCheckoutSession } from "@/lib/stripe";
import { useAppDispatch, useAppSelector } from "./_stores/hooks";
import { setDarkMode } from "./_stores/darkModeSlice";

function HomePageContent() {
  const user = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.darkMode.isEnabled);

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
      {/* Sticky Header */}
      <header className="sticky top-4 z-50 mx-4 sm:mx-6 lg:mx-8">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 transition-all duration-300 hover:shadow-xl">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                  HR Software
                </h1>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <a
                  href="#features"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-slate-800/50"
                >
                  Funzionalità
                </a>
                <a
                  href="#pricing"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-slate-800/50"
                >
                  Prezzi
                </a>
              </nav>
              <div className="flex items-center space-x-4">
                {/* Dark Mode Toggle */}
                <button
                  onClick={() => dispatch(setDarkMode(null))}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 transition-all duration-200"
                  aria-label="Toggle dark mode"
                >
                  <Icon 
                    path={darkMode ? mdiWeatherSunny : mdiWeatherNight} 
                    size="20" 
                  />
                </button>
                
                {user ? (
                  <>
                    <div className="flex items-center space-x-3">
                      {/* Avatar con pallino verde */}
                      <div className="relative">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <Icon path={mdiAccount} size="16" className="text-blue-600 dark:text-blue-400" />
                        </div>
                        {/* Pallino verde per indicare lo stato online */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
                      </div>
                      <span className="hidden sm:block text-gray-600 dark:text-gray-300 text-sm">
                        Ciao, {user.displayName || user.primaryEmail}
                      </span>
                    </div>
                    <button
                      onClick={() => user.signOut()}
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-slate-800/50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <a
                      href="/handler/sign-in"
                      className="group relative text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                      <span className="relative z-10">Accedi</span>
                      <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 origin-center"></div>
                    </a>
                    <a
                      href="/handler/sign-up"
                      className="group relative bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg overflow-hidden"
                    >
                      <span className="relative z-10">Inizia Gratis</span>
                      <div className="absolute inset-0 bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </a>
                  </>
                )}
                
                {/* Mobile menu button */}
                <button className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-blue-50 dark:bg-slate-900 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          {/* Trust indicators */}
          <div className="flex justify-center items-center gap-8 mb-8 slide-up opacity-70">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Sicuro e Affidabile</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Icon path={mdiShield} size="16" className="text-blue-600" />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Icon path={mdiStar} size="16" className="text-blue-500" />
              <span>4.9/5 Rating</span>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 slide-up leading-tight">
            <span className="text-gray-900 dark:text-white">Il Software HR</span>
            <br />
            <span className="text-gradient-animated">All-in-One</span>
            <br />
            <span className="text-gray-900 dark:text-white">per la tua Azienda</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto slide-up-delay-1 leading-relaxed">
            Gestisci presenze, ferie, buste paga e molto altro con un'unica piattaforma. 
            <br className="hidden md:block" />
            <strong>Semplifica i processi HR</strong> e concentrati su ciò che conta davvero.
          </p>

          {/* Stats */}
          <div className="flex justify-center items-center gap-8 mb-10 slide-up-delay-1">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Aziende Clienti</div>
            </div>
            <div className="w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">50k+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Dipendenti Gestiti</div>
              </div>
              <div className="w-px h-12 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">99.9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center slide-up-delay-2">
            <button
              onClick={handleStarterPlanClick}
              className="group relative bg-blue-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 pulse-glow"
            >
              <span className="relative z-10">Inizia con Starter - €9.99/mese</span>
              <div className="absolute inset-0 bg-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <a
              href="#features"
              className="group bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-xl dark:bg-slate-800/80 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:border-blue-500 dark:hover:text-blue-400"
            >
              <span className="flex items-center justify-center gap-2">
                Scopri di più
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
          </div>

          {/* Social proof */}
          <div className="mt-12 slide-up-delay-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Scelto da aziende leader in Italia</p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400">TechCorp</div>
              <div className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400">InnovateSrl</div>
              <div className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400">FutureWork</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-12 scroll-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
              Tutto quello che serve per gestire le Risorse Umane
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400" style={{ fontFamily: "'Inter', sans-serif" }}>
              Una soluzione completa per semplificare tutti i processi HR
            </p>
          </div>

          <div className="grid gap-14 md:grid-cols-3 md:gap-5">
            <div className="rounded-xl bg-white p-6 text-center shadow-xl dark:bg-slate-900 scroll-fade-in stagger-1">
              <div className="mx-auto flex h-16 w-16 -translate-y-12 transform items-center justify-center rounded-full bg-blue-500 shadow-lg shadow-blue-500/40">
                <Icon path={mdiCalendarClock} size="24" className="text-white" />
              </div>
              <h1 className="text-darken mb-3 text-xl font-medium lg:px-14 text-gray-900 dark:text-white">
                GESTIONE PRESENZE
              </h1>
              <p className="px-4 text-gray-500 dark:text-gray-400">
                Traccia orari di lavoro, straordinari e pause con facilità. Sistema di timbratura digitale integrato per una gestione completa.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 text-center shadow-xl dark:bg-slate-900 scroll-fade-in stagger-2">
              <div className="mx-auto flex h-16 w-16 -translate-y-12 transform items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/40">
                <Icon path={mdiAccountMultiple} size="24" className="text-white" />
              </div>
              <h1 className="text-darken mb-3 text-xl font-medium lg:px-14 text-gray-900 dark:text-white">
                GESTIONE DIPENDENTI
              </h1>
              <p className="px-4 text-gray-500 dark:text-gray-400">
                Database completo dei dipendenti con documenti, contratti e informazioni personali. Tutto organizzato in un unico posto.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 text-center shadow-xl dark:bg-slate-900 scroll-fade-in stagger-3">
              <div className="mx-auto flex h-16 w-16 -translate-y-12 transform items-center justify-center rounded-full bg-blue-700 shadow-lg shadow-blue-700/40">
                <Icon path={mdiFileDocument} size="24" className="text-white" />
              </div>
              <h1 className="text-darken mb-3 text-xl font-medium lg:px-14 text-gray-900 dark:text-white">
                FERIE E PERMESSI
              </h1>
              <p className="px-4 text-gray-500 dark:text-gray-400">
                Richieste e approvazioni automatizzate. Calendario condiviso per una migliore pianificazione delle assenze aziendali.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 text-center shadow-xl dark:bg-slate-900 scroll-fade-in stagger-4">
              <div className="mx-auto flex h-16 w-16 -translate-y-12 transform items-center justify-center rounded-full bg-blue-500 shadow-lg shadow-blue-500/40">
                <Icon path={mdiChartLine} size="24" className="text-white" />
              </div>
              <h1 className="text-darken mb-3 text-xl font-medium lg:px-14 text-gray-900 dark:text-white">
                REPORT E ANALYTICS
              </h1>
              <p className="px-4 text-gray-500 dark:text-gray-400">
                Dashboard dettagliate con metriche HR, report personalizzabili e analisi dei dati per decisioni strategiche informate.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 text-center shadow-xl dark:bg-slate-900 scroll-fade-in stagger-5">
              <div className="mx-auto flex h-16 w-16 -translate-y-12 transform items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/40">
                <Icon path={mdiCog} size="24" className="text-white" />
              </div>
              <h1 className="text-darken mb-3 text-xl font-medium lg:px-14 text-gray-900 dark:text-white">
                AUTOMAZIONE
              </h1>
              <p className="px-4 text-gray-500 dark:text-gray-400">
                Workflow automatizzati per onboarding, valutazioni e processi ricorrenti. Risparmia tempo e riduci gli errori manuali.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 text-center shadow-xl dark:bg-slate-900">
              <div className="mx-auto flex h-16 w-16 -translate-y-12 transform items-center justify-center rounded-full bg-blue-700 shadow-lg shadow-blue-700/40">
                <Icon path={mdiShield} size="24" className="text-white" />
              </div>
              <h1 className="text-darken mb-3 text-xl font-medium lg:px-14 text-gray-900 dark:text-white">
                SICUREZZA E PRIVACY
              </h1>
              <p className="px-4 text-gray-500 dark:text-gray-400">
                Conformità GDPR, crittografia dei dati e controlli di accesso avanzati per la massima protezione aziendale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-slate-800">
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
                  <Icon path={mdiCheck} size="20" className="text-blue-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Fino a 3 utenti</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-blue-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Gestione presenze base</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-blue-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Richieste ferie</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-blue-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Report base</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-blue-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Supporto email</span>
                </li>
              </ul>

              <a
                href="/handler/sign-up"
                className="group w-full bg-gray-600 text-white py-4 px-6 rounded-xl text-center font-semibold hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg block"
              >
                <span className="flex items-center justify-center gap-2">
                  Inizia Gratis
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
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
                  <Icon path={mdiCheck} size="20" className="text-blue-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Fino a 30 utenti</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-blue-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Gestione presenze avanzata</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-blue-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Workflow automatizzati</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-blue-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Report personalizzati</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-blue-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Integrazioni API</span>
                </li>
                <li className="flex items-center">
                  <Icon path={mdiCheck} size="20" className="text-blue-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Supporto prioritario</span>
                </li>
              </ul>

              <button
                onClick={handleStarterPlanClick}
                disabled={isLoading}
                className="group w-full bg-blue-600 text-white py-4 px-6 rounded-xl text-center font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none pulse-glow"
              >
                <span className="flex items-center justify-center gap-2">
                  {isLoading ? 'Caricamento...' : 'Inizia con Starter'}
                  {!isLoading && (
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-blue-600 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 slide-up">
            Pronto a Trasformare
            <br />
            <span className="text-gradient text-blue-400">la tua Gestione HR?</span>
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto slide-up-delay-1 leading-relaxed">
            Unisciti a <strong>migliaia di aziende</strong> che hanno già semplificato i loro processi HR con la nostra piattaforma.
            <br className="hidden md:block" />
            Inizia oggi stesso e scopri la differenza.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center slide-up-delay-2">
            <a
              href="/handler/sign-up"
              className="group bg-white text-blue-600 px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-50 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-3"
            >
              <span>Inizia la Prova Gratuita</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4 text-white transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </a>
            
            <button
              onClick={handleStarterPlanClick}
              className="group bg-transparent border-2 border-white/30 backdrop-blur-sm text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-3"
            >
              <span>Vai a Starter - €9.99</span>
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 slide-up-delay-3">
            <div className="flex justify-center items-center gap-8 text-blue-100">
              <div className="flex items-center gap-2">
                <Icon path={mdiShield} size="20" className="text-green-400" />
                <span className="text-sm">Sicuro al 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon path={mdiCheck} size="20" className="text-green-400" />
                <span className="text-sm">Setup in 5 minuti</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon path={mdiStar} size="20" className="text-yellow-400" />
                <span className="text-sm">Supporto 24/7</span>
              </div>
            </div>
          </div>
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
