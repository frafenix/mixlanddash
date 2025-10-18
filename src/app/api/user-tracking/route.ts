import { NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { saveUserToDatabase } from '@/lib/user-tracking';

export async function POST() {
  try {
    // Ottieni l'utente autenticato
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Utente non autenticato' }, { status: 401 });
    }
    
    // Prepara i dati dell'utente nel formato corretto
    const userData = {
      id: user.id,
      primaryEmail: user.primaryEmail || undefined
    };
    
    // Salva l'utente nel database
    const result = await saveUserToDatabase(userData);
    
    return NextResponse.json({ 
      success: true, 
      isNewUser: result === true,
      userId: user.id
    });
  } catch (error) {
    console.error('Errore nel tracciamento utente:', error);
    return NextResponse.json({ success: false, error: 'Errore interno' }, { status: 500 });
  }
}