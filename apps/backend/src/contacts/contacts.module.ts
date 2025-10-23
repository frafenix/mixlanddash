import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DrizzleModule, AuthModule],
  controllers: [ContactsController],
  providers: [ContactsService],
})
export class ContactsModule {}