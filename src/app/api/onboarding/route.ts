import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { companies, locations, teams } from '@/db/schema'
import { stackServerApp } from '@/lib/stack'
import { eq } from 'drizzle-orm'

const onboardingSchema = z.object({
  companyName: z.string().min(1, 'Nome azienda richiesto'),
  companyDescription: z.string().optional(),
  locations: z.array(z.object({
    name: z.string().min(1, 'Nome sede richiesto'),
    address: z.string().min(1, 'Indirizzo richiesto'),
  })).min(1, 'Almeno una sede è richiesta'),
  teams: z.array(z.object({
    name: z.string().min(1, 'Nome team richiesto'),
    description: z.string().optional(),
  })).min(1, 'Almeno un team è richiesto'),
})

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione utente
    const user = await stackServerApp.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Valida i dati del form
    const body = await request.json()
    const validatedData = onboardingSchema.parse(body)

    // Esegue le operazioni in sequenza senza transazione
    // 1. Crea l'azienda
    const [company] = await db.insert(companies).values({
      name: validatedData.companyName,
      otherInfo: validatedData.companyDescription ? { description: validatedData.companyDescription } : null,
      userId: user.id,
      onboardingCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    // 2. Crea le sedi
    const locationResults = await Promise.all(
      validatedData.locations.map(location =>
        db.insert(locations).values({
          address: location.address,
          city: location.address.split(',').pop()?.trim() || '', // Estrae la città dall'indirizzo
          companyId: company.id,
          createdAt: new Date(),
        }).returning()
      )
    )

    // 3. Crea i team
    const teamResults = await Promise.all(
      validatedData.teams.map(team =>
        db.insert(teams).values({
          name: team.name,
          description: team.description || null,
          companyId: company.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).returning()
      )
    )

    const result = {
      company,
      locations: locationResults.flat(),
      teams: teamResults.flat(),
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completato con successo',
      data: result,
    })

  } catch (error) {
    console.error('Errore durante onboarding:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dati non validi',
          details: error.issues 
        },
        { status: 400 }
      )
    }
    
    // Gestione errori di database
    if (error instanceof Error) {
      const errorMessage = error.message || 'Errore interno del server';
      return NextResponse.json(
        { 
          error: errorMessage,
          details: { message: errorMessage }
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Errore interno del server',
        details: { message: 'Si è verificato un errore imprevisto durante l\'onboarding' }
      },
      { status: 500 }
    )
  }
}

// GET per verificare lo stato dell'onboarding
export async function GET() {
  try {
    const user = await stackServerApp.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Cerca se l'utente ha già completato l'onboarding
    const userCompany = await db.query.companies.findFirst({
      where: eq(companies.userId, user.id),
      with: {
        locations: true,
        teams: true,
      }
    })

    return NextResponse.json({
      hasCompletedOnboarding: !!userCompany?.onboardingCompleted,
      company: userCompany || null,
    })

  } catch (error) {
    console.error('Errore nel controllo onboarding:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}