import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { createInvitation, type CreateInvitationData } from '@/lib/invitations';
import { requirePermission } from '@/lib/auth-helpers';
import { z } from 'zod';

// Schema di validazione per la richiesta
const createInvitationSchema = z.object({
  email: z.string().email('Email non valida'),
  role: z.enum(['manager', 'user'], {
    message: 'Il ruolo deve essere manager o user'
  }),
  companyId: z.number().optional(),
  teamId: z.number().optional(),
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

    // Verifica permission per creare inviti (solo admin)
    const checkPermission = requirePermission('invitations:create');
    await checkPermission(user.id);

    // Valida i dati della richiesta
    const body = await request.json();
    const validatedData = createInvitationSchema.parse(body);

    // Crea l'invito
    const invitationData: CreateInvitationData = {
      ...validatedData,
      invitedBy: user.id,
    };

    const invitation = await createInvitation(invitationData);

    // TODO: Invia email di invito
    // await sendInvitationEmail(invitation.email, invitation.invitationUrl);

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        invitationUrl: invitation.invitationUrl,
      },
    });

  } catch (error) {
    console.error('Error creating invitation:', error);
    
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