"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const stack_1 = require("@stackframe/stack");
const common_2 = require("@nestjs/common");
const pg_core_1 = require("drizzle-orm/pg-core");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt = __importStar(require("bcrypt"));
const z = __importStar(require("zod"));
const config_1 = require("@nestjs/config");
const jwt = __importStar(require("jsonwebtoken"));
const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    tenantName: z.string().min(3),
});
const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});
let AuthService = class AuthService {
    db;
    config;
    stack;
    constructor(db, config) {
        this.db = db;
        this.config = config;
        this.stack = new stack_1.StackServerApp({
            projectId: this.config.get('NEXT_PUBLIC_STACK_PROJECT_ID'),
            secretServerKey: this.config.get('STACK_SECRET_SERVER_KEY'),
            tokenStore: 'nextjs-cookie',
        });
    }
    async register(data) {
        const parsed = RegisterSchema.parse(data);
        const hashedPassword = await bcrypt.hash(parsed.password, 10);
        const [newTenant] = await this.db.insert(schema_1.tenants).values({
            name: parsed.tenantName,
        }).returning();
        const [newUser] = await this.db.insert(schema_1.users).values({
            email: parsed.email,
            passwordHash: hashedPassword,
            tenantId: newTenant.id,
        }).returning();
        await this.db.insert(schema_1.userTenants).values({
            userId: newUser.id,
            tenantId: newTenant.id,
        });
        const token = jwt.sign({ userId: newUser.id, tenantId: newTenant.id }, this.config.get('JWT_SECRET') || 'fallback-secret', { expiresIn: '24h' });
        return { token, user: newUser };
    }
    async login(data) {
        const parsed = LoginSchema.parse(data);
        const [user] = await this.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, parsed.email));
        if (!user || !(await bcrypt.compare(parsed.password, user.passwordHash))) {
            throw new common_1.UnauthorizedException('Credenziali non valide');
        }
        const token = jwt.sign({ userId: user.id, tenantId: user.tenantId }, this.config.get('JWT_SECRET') || 'fallback-secret', { expiresIn: '24h' });
        return { token, user };
    }
    async verifyToken(token) {
        try {
            const payload = jwt.verify(token, this.config.get('JWT_SECRET') || 'fallback-secret');
            return payload;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token non valido');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_2.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [pg_core_1.PgDatabase,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map