'use client';

import { useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { getCookie, deleteCookie } from 'cookies-next';

/**
 * Componente invisibile che traccia gli utenti autenticati
 * Da inserire nel layout principale dell'applicazione
 */
export function UserTracker() {
  const currentUser = useUser();

  useEffect(() => {
    // Verifica se l'utente è autenticato e se c'è il cookie di tracciamento
    if (currentUser && currentUser.id && getCookie('track_user')) {
      // Rimuovi il cookie per evitare chiamate ripetute
      deleteCookie('track_user');
      
      // Effettua la chiamata API per tracciare l'utente
      fetch('/api/user-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .catch((error) => {
          console.error('Errore nel tracciamento utente:', error);
        });
    }
  }, [currentUser]);

  // Componente invisibile - non renderizza nulla
  return null;
}