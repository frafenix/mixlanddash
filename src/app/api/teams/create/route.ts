import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stackServerApp } from '@/lib/stack';
import { requirePermission } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { teams } from '@/db/schema';

const createTeamSchema = z.object({
  name: z.string().min(1, { message: 'Il nome del team è richiesto.' }),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Richiede il permesso 'teams:create' (solo admin/manager)
    requirePermission('teams:create')(user.role);

    const body = await request.json();
    const validatedData = createTeamSchema.parse(body);

    // TODO: Recuperare companyId dall'utente o dal contesto
    // Per ora, useremo un companyId fittizio o il primo disponibile
    const companyId = 1; // Placeholder

    const [newTeam] = await db.insert(teams).values({
      name: validatedData.name,
      description: validatedData.description,
      companyId: companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Team creato con successo',
      team: newTeam,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating team:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((issue) => issue.message).join(', ') },
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