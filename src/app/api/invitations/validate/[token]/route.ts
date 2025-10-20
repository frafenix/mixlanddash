import { NextRequest, NextResponse } from 'next/server';
import { validateInvitationToken } from '@/lib/invitations';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: 'Token mancante' },
        { status: 400 }
      );
    }

    // Valida il token
    const invitation = await validateInvitationToken(token);

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        companyId: invitation.companyId,
        teamId: invitation.teamId,
      },
    });

  } catch (error) {
    console.error('Error validating invitation token:', error);
    
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