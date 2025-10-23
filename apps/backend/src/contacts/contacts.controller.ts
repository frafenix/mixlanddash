import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Post()
  async create(@Req() req, @Body() body) {
    return this.contactsService.create(req.user, body);
  }

  @Get()
  async findAll(@Req() req) {
    return this.contactsService.findAll(req.user);
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    return this.contactsService.findOne(req.user, id);
  }

  @Put(':id')
  async update(@Req() req, @Param('id') id: string, @Body() body) {
    return this.contactsService.update(req.user, id, body);
  }

  @Delete(':id')
  async delete(@Req() req, @Param('id') id: string) {
    return this.contactsService.delete(req.user, id);
  }
}