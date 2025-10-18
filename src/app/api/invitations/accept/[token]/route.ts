import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { acceptInvitation } from '@/lib/invitations';

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Verifica autenticazione
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: 'Token mancante' },
        { status: 400 }
      );
    }

    // Accetta l'invito
    const acceptedInvitation = await acceptInvitation(token, user.id);

    return NextResponse.json({
      success: true,
      message: 'Invito accettato con successo',
      invitation: {
        id: acceptedInvitation.id,
        email: acceptedInvitation.email,
        role: acceptedInvitation.role,
        acceptedAt: acceptedInvitation.acceptedAt,
      },
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    
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