import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ConfigService } from '@nestjs/config';
import * as schema from '../db/schema';

@Module({
  providers: [
    {
      provide: 'DRIZZLE_DB',
      useFactory: async (config: ConfigService) => {
        const pool = new Pool({
          connectionString: config.get('DATABASE_URL'),
        });
        return drizzle(pool, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DRIZZLE_DB'],
})
export class DrizzleModule {}