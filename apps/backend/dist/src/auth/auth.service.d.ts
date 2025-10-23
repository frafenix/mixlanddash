import { PgDatabase } from 'drizzle-orm/pg-core';
import * as z from 'zod';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
declare const RegisterSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    tenantName: z.ZodString;
}, z.core.$strip>;
declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare class AuthService {
    private db;
    private config;
    private stack;
    constructor(db: PgDatabase<any>, config: ConfigService);
    register(data: z.infer<typeof RegisterSchema>): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            passwordHash: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            firstName: string | null;
            lastName: string | null;
        };
    }>;
    login(data: z.infer<typeof LoginSchema>): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            passwordHash: string;
            tenantId: string;
            firstName: string | null;
            lastName: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    verifyToken(token: string): Promise<string | jwt.JwtPayload>;
}
export {};
