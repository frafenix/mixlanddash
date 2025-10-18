import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { getInvitationsByAdmin } from '@/lib/invitations';
import { requirePermission } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Verifica permission per leggere inviti (solo admin)
    const checkPermission = requirePermission('invitations:read');
    await checkPermission(user.id);

    // Ottieni tutti gli inviti creati da questo admin
    const invitations = await getInvitationsByAdmin(user.id);

    return NextResponse.json({
      success: true,
      invitations: invitations.map(invitation => ({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        acceptedAt: invitation.acceptedAt,
        companyId: invitation.companyId,
        teamId: invitation.teamId,
      })),
    });

  } catch (error) {
    console.error('Error listing invitations:', error);
    
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