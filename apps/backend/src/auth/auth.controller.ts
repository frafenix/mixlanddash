import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body) {
    return this.authService.login(body);
  }

  @UseGuards(AuthGuard)
  @Get('verify')
  async verify(@Req() req) {
    return req.user; // Payload dal token
  }
}