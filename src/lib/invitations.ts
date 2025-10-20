import { db } from '@/lib/db';
import { invitations, users, type Role } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// Durata default degli inviti (7 giorni)
const INVITATION_EXPIRY_DAYS = 7;

// Genera un token sicuro per l'invito
function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Calcola la data di scadenza
function getExpiryDate(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + INVITATION_EXPIRY_DAYS);
  return expiry;
}

// Interfaccia per creare un invito
export interface CreateInvitationData {
  email: string;
  role: Role;
  invitedBy: string; // User ID dell'admin
  companyId?: number;
  teamId?: number;
}

// Crea un nuovo invito
export async function createInvitation(data: CreateInvitationData) {
  // Verifica che l'email non sia già registrata
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error('Un utente con questa email è già registrato');
  }

  // Verifica che non ci sia già un invito pending per questa email
  const existingInvitation = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.email, data.email),
        eq(invitations.status, 'pending')
      )
    )
    .limit(1);

  if (existingInvitation.length > 0) {
    throw new Error('Esiste già un invito pending per questa email');
  }

  // Crea il nuovo invito
  const token = generateInvitationToken();
  const expiresAt = getExpiryDate();

  const [invitation] = await db
    .insert(invitations)
    .values({
      token,
      email: data.email,
      role: data.role,
      invitedBy: data.invitedBy,
      companyId: data.companyId,
      teamId: data.teamId,
      expiresAt,
    })
    .returning();

  return {
    ...invitation,
    invitationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`,
  };
}

// Valida un token di invito
export async function validateInvitationToken(token: string) {
  const [invitation] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1);

  if (!invitation) {
    throw new Error('Invito non trovato');
  }

  if (invitation.status !== 'pending') {
    throw new Error('Questo invito non è più valido');
  }

  if (new Date() > invitation.expiresAt) {
    // Marca l'invito come scaduto
    await db
      .update(invitations)
      .set({ 
        status: 'expired',
        updatedAt: new Date(),
      })
      .where(eq(invitations.id, invitation.id));
    
    throw new Error('Questo invito è scaduto');
  }

  return invitation;
}

// Accetta un invito (chiamato dopo la registrazione dell'utente)
export async function acceptInvitation(token: string, userId: string) {
  const invitation = await validateInvitationToken(token);

  // Verifica che l'utente che accetta abbia la stessa email dell'invito
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || user.email !== invitation.email) {
    throw new Error('Email non corrispondente all\'invito');
  }

  // Aggiorna il ruolo dell'utente secondo l'invito
  await db
    .update(users)
    .set({ 
      role: invitation.role,
    })
    .where(eq(users.id, userId));

  // Marca l'invito come accettato
  await db
    .update(invitations)
    .set({
      status: 'accepted',
      acceptedAt: new Date(),
      acceptedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(invitations.id, invitation.id));

  return {
    ...invitation,
    acceptedBy: userId,
    acceptedAt: new Date(),
  };
}

// Revoca un invito (solo admin)
export async function revokeInvitation(invitationId: number, revokedBy: string) {
  const [invitation] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.id, invitationId))
    .limit(1);

  if (!invitation) {
    throw new Error('Invito non trovato');
  }

  if (invitation.status !== 'pending') {
    throw new Error('Solo gli inviti pending possono essere revocati');
  }

  await db
    .update(invitations)
    .set({
      status: 'revoked',
      updatedAt: new Date(),
    })
    .where(eq(invitations.id, invitationId));

  return invitation;
}

// Ottieni tutti gli inviti di un admin
export async function getInvitationsByAdmin(adminId: string) {
  return await db
    .select()
    .from(invitations)
    .where(eq(invitations.invitedBy, adminId))
    .orderBy(invitations.createdAt);
}

// Pulisci inviti scaduti (da eseguire periodicamente)
export async function cleanupExpiredInvitations() {
  const now = new Date();
  
  const expiredInvitations = await db
    .update(invitations)
    .set({
      status: 'expired',
      updatedAt: now,
    })
    .where(
      and(
        eq(invitations.status, 'pending'),
        // Usa una query SQL raw per il confronto delle date
      )
    )
    .returning();

  return expiredInvitations.length;
}