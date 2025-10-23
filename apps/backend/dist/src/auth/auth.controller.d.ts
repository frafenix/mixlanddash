import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(body: any): Promise<{
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
    login(body: any): Promise<{
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
    verify(req: any): Promise<any>;
}
