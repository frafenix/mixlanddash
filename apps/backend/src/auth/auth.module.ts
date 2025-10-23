import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DrizzleModule } from '../drizzle/drizzle.module'; // Assumo modulo Drizzle esistente o da creare
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [DrizzleModule, ConfigModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}