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
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const z = __importStar(require("zod"));
const AnagraficaSchema = z.object({
    tipoSoggetto: z.enum(['privato', 'azienda', 'pa', 'condominio']),
    isFornitore: z.boolean().default(false),
    ragioneSociale: z.string().optional(),
    nome: z.string().optional(),
    cognome: z.string().optional(),
    codiceFiscale: z.string().min(1, 'Codice fiscale obbligatorio'),
    partitaIva: z.string().optional(),
    codiceDestinatarioSdi: z.string().optional(),
    codiceUnivocoIpa: z.string().optional(),
    pec: z.string().email().optional().or(z.literal('')),
    email: z.string().email('Email non valida'),
    telefono: z.string().optional(),
    cellulare: z.string().optional(),
    via: z.string().min(1, 'Via obbligatoria'),
    numeroCivico: z.string().optional(),
    cap: z.string().min(5, 'CAP deve essere di 5 cifre').max(5),
    citta: z.string().min(1, 'Città obbligatoria'),
    provincia: z.string().min(2, 'Provincia deve essere di 2 lettere').max(2),
    nazione: z.string().default('IT'),
    indirizzoSpedizioneDiverso: z.boolean().default(false),
    viaSpedizione: z.string().optional(),
    numeroCivicoSpedizione: z.string().optional(),
    capSpedizione: z.string().optional(),
    cittaSpedizione: z.string().optional(),
    provinciaSpedizione: z.string().optional(),
    nazioneSpedizione: z.string().optional(),
    tipoCliente: z.string().optional(),
    iban: z.string().optional(),
    condizioniPagamento: z.string().optional(),
    referente: z.string().optional(),
    note: z.string().optional(),
    status: z.enum(['attivo', 'in_attesa', 'blacklist']).default('attivo'),
});
let ContactsService = class ContactsService {
    db;
    constructor(db) {
        this.db = db;
    }
    async create(user, data) {
        const parsed = AnagraficaSchema.parse(data);
        const dbData = {
            ...parsed,
            isFornitore: parsed.isFornitore ? 'true' : 'false',
            indirizzoSpedizioneDiverso: parsed.indirizzoSpedizioneDiverso ? 'true' : 'false',
            tenantId: user.tenantId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return this.db.insert(schema_1.contacts).values(dbData).returning();
    }
    async findAll(user) {
        const results = await this.db.select().from(schema_1.contacts).where((0, drizzle_orm_1.eq)(schema_1.contacts.tenantId, user.tenantId));
        return results.map(contact => ({
            ...contact,
            isFornitore: contact.isFornitore === 'true',
            indirizzoSpedizioneDiverso: contact.indirizzoSpedizioneDiverso === 'true',
        }));
    }
    async findOne(user, id) {
        const [contact] = await this.db.select().from(schema_1.contacts).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.contacts.id, id), (0, drizzle_orm_1.eq)(schema_1.contacts.tenantId, user.tenantId)));
        if (!contact)
            throw new common_1.ForbiddenException('Contatto non trovato o non autorizzato');
        return {
            ...contact,
            isFornitore: contact.isFornitore === 'true',
            indirizzoSpedizioneDiverso: contact.indirizzoSpedizioneDiverso === 'true',
        };
    }
    async update(user, id, data) {
        const parsed = AnagraficaSchema.partial().parse(data);
        const dbData = {
            ...parsed,
            updatedAt: new Date(),
        };
        if (parsed.isFornitore !== undefined) {
            dbData.isFornitore = parsed.isFornitore ? 'true' : 'false';
        }
        if (parsed.indirizzoSpedizioneDiverso !== undefined) {
            dbData.indirizzoSpedizioneDiverso = parsed.indirizzoSpedizioneDiverso ? 'true' : 'false';
        }
        const results = await this.db.update(schema_1.contacts).set(dbData).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.contacts.id, id), (0, drizzle_orm_1.eq)(schema_1.contacts.tenantId, user.tenantId))).returning();
        return results.map(contact => ({
            ...contact,
            isFornitore: contact.isFornitore === 'true',
            indirizzoSpedizioneDiverso: contact.indirizzoSpedizioneDiverso === 'true',
        }));
    }
    async delete(user, id) {
        return this.db.delete(schema_1.contacts).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.contacts.id, id), (0, drizzle_orm_1.eq)(schema_1.contacts.tenantId, user.tenantId))).returning();
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_2.Inject)('DRIZZLE_DB')),
    __metadata("design:paramtypes", [node_postgres_1.NodePgDatabase])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map