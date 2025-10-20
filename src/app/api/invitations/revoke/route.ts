import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { revokeInvitation } from '@/lib/invitations';
import { requirePermission } from '@/lib/auth-helpers';
import { z } from 'zod';

// Schema di validazione per la richiesta
const revokeInvitationSchema = z.object({
  invitationId: z.number().positive('ID invito non valido'),
});

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Verifica permission per revocare inviti (solo admin)
    const checkPermission = requirePermission('invitations:revoke');
    await checkPermission(user.id);

    // Valida i dati della richiesta
    const body = await request.json();
    const { invitationId } = revokeInvitationSchema.parse(body);

    // Revoca l'invito
    const revokedInvitation = await revokeInvitation(invitationId, user.id);

    return NextResponse.json({
      success: true,
      message: 'Invito revocato con successo',
      invitation: {
        id: revokedInvitation.id,
        email: revokedInvitation.email,
        status: 'revoked',
      },
    });

  } catch (error) {
    console.error('Error revoking invitation:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}