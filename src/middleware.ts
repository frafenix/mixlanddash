import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { stackServerApp } from '@/lib/stack';

// Nota: Non possiamo importare direttamente saveUserToDatabase qui
// perché il middleware viene eseguito nell'edge runtime che non supporta
// operazioni di database. Useremo un approccio alternativo.

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Recupera l'utente (senza query al DB: l'edge runtime non supporta il driver Node)
  let user: Awaited<ReturnType<typeof stackServerApp.getUser>> | null = null;
  try {
    user = await stackServerApp.getUser();
  } catch (e) {
    // Ignora errori di runtime edge
    user = null;
  }
  
  // Se l'utente è autenticato, impostiamo un cookie per indicare che deve essere salvato nel DB
  // Questo cookie verrà letto da un componente lato client che effettuerà la chiamata API
  if (user) {
    const response = NextResponse.next();
    // Impostiamo un cookie che indica che l'utente deve essere tracciato
    // Questo cookie verrà letto da un componente che effettuerà la chiamata API
    response.cookies.set('track_user', 'true', { 
      maxAge: 60, // 1 minuto è sufficiente
      path: '/',
      httpOnly: false // Deve essere leggibile dal client
    });
    
    // Continuiamo con il middleware
    return response;
  }

  // Gestione speciale per il flusso di autenticazione
  // Controlla se l'utente proviene da una pagina di autenticazione
  const referer = request.headers.get('referer') || '';
  const isFromAuth = referer.includes('/handler/sign-in') || 
                     referer.includes('/handler/sign-up') || 
                     referer.includes('/api/auth');

  // Se l'utente è autenticato e arriva alla root, verifica se deve essere reindirizzato all'onboarding
  if (user && pathname === '/') {
    // Controlla se c'è un parametro returnTo
    const returnTo = url.searchParams.get('returnTo');
    if (returnTo === 'onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    
    // Verifica se l'utente ha completato l'onboarding
    // Nota: non possiamo fare query al DB qui, quindi reindirizzamo alla dashboard
    // e lì verrà fatto il controllo completo
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Utente non autenticato: limita l'accesso alle route protette
  if (!user) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')) {
      // Aggiungiamo il parametro returnTo per tornare alla pagina originale dopo il login
      const signInUrl = new URL('/handler/sign-in', request.url);
      signInUrl.searchParams.set('returnTo', pathname);
      
      // Aggiungiamo un parametro per indicare che proviene da un redirect del middleware
      signInUrl.searchParams.set('from', 'middleware');
      
      return NextResponse.redirect(signInUrl);
    }
  }
  
  // Previeni il flash di contenuto non autenticato dopo la registrazione
  if (isFromAuth && !user && pathname === '/') {
    // Aggiungiamo un header di risposta per indicare che è in corso un caricamento
    const response = NextResponse.next();
    response.headers.set('X-Loading-Auth', '1');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};