import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginResponse } from '../types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { playerId: string }): Promise<LoginResponse> {
    if (!body.playerId) {
      throw new UnauthorizedException('playerId is required');
    }
    return this.authService.login(body.playerId);
  }
}
