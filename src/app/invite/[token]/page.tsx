'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';

interface InvitationData {
  id: number;
  email: string;
  role: string;
  invitedBy: string;
  expiresAt: string;
  companyId?: number;
  teamId?: number;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const user = useUser();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  const token = params.token as string;

  useEffect(() => {
    if (token) {
      validateInvitation();
    }
  }, [token]);

  useEffect(() => {
    // Se l'utente è già loggato e abbiamo un invito valido, accettalo automaticamente
    if (user && invitation && !accepting) {
      acceptInvitation();
    }
  }, [user, invitation]);

  const validateInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/validate/${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invito non valido');
      }

      setInvitation(data.invitation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!user || !invitation) return;

    setAccepting(true);
    try {
      const response = await fetch(`/api/invitations/accept/${token}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nell\'accettazione dell\'invito');
      }

      // Redirect alla dashboard dopo l'accettazione
      router.push('/dashboard?invited=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'accettazione');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Validazione invito...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Invito non valido
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Torna alla home
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-blue-500 text-6xl mb-4">📧</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sei stato invitato!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sei stato invitato come <strong>{invitation?.role}</strong>
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <strong>Email:</strong> {invitation?.email}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <strong>Ruolo:</strong> {invitation?.role}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Scade il:</strong> {invitation?.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString('it-IT') : 'N/A'}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/handler/sign-up?email=${encodeURIComponent(invitation?.email || '')}&returnTo=${encodeURIComponent(`/invite/${token}`)}`)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Registrati e accetta invito
            </button>
            <button
              onClick={() => router.push(`/handler/sign-in?email=${encodeURIComponent(invitation?.email || '')}&returnTo=${encodeURIComponent(`/invite/${token}`)}`)}
              className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
            >
              Accedi se hai già un account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (accepting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Accettazione invito...</p>
        </div>
      </div>
    );
  }

  return null;
}