import { Injectable, UnauthorizedException } from '@nestjs/common';
import { StackServerApp } from '@stackframe/stack';
import { Inject } from '@nestjs/common';
import { PgDatabase } from 'drizzle-orm/pg-core';
import * as schema from '../db/schema';
import { users, tenants, userTenants } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import * as z from 'zod';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  tenantName: z.string().min(3),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

@Injectable()
export class AuthService {
  private stack: StackServerApp;

  constructor(
    @Inject('DRIZZLE_DB') private db: PgDatabase<any>,
    private config: ConfigService,
  ) {
    this.stack = new StackServerApp({
      projectId: this.config.get('NEXT_PUBLIC_STACK_PROJECT_ID'),
      secretServerKey: this.config.get('STACK_SECRET_SERVER_KEY'),
      tokenStore: 'nextjs-cookie',
    });
  }

  async register(data: z.infer<typeof RegisterSchema>) {
    const parsed = RegisterSchema.parse(data);
    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    // Crea tenant
    const [newTenant] = await this.db.insert(tenants).values({
      name: parsed.tenantName,
    }).returning();

    // Crea utente
    const [newUser] = await this.db.insert(users).values({
      email: parsed.email,
      passwordHash: hashedPassword,
      tenantId: newTenant.id, // Associa al tenant
    }).returning();

    // Associa user-tenant
    await this.db.insert(userTenants).values({
      userId: newUser.id,
      tenantId: newTenant.id,
    });

    // Genera token JWT personalizzato per ora
    const token = jwt.sign(
      { userId: newUser.id, tenantId: newTenant.id },
      this.config.get('JWT_SECRET') || 'fallback-secret',
      { expiresIn: '24h' }
    );
    return { token, user: newUser };
  }

  async login(data: z.infer<typeof LoginSchema>) {
    const parsed = LoginSchema.parse(data);
    const [user] = await this.db.select().from(users).where(eq(users.email, parsed.email));
    if (!user || !(await bcrypt.compare(parsed.password, user.passwordHash))) {
      throw new UnauthorizedException('Credenziali non valide');
    }

    const token = jwt.sign(
      { userId: user.id, tenantId: user.tenantId },
      this.config.get('JWT_SECRET') || 'fallback-secret',
      { expiresIn: '24h' }
    );
    return { token, user };
  }

  async verifyToken(token: string) {
    try {
      const payload = jwt.verify(token, this.config.get('JWT_SECRET') || 'fallback-secret');
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Token non valido');
    }
  }
}