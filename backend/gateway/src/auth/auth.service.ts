import { Injectable, Inject, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom, timeout } from 'rxjs';
import { LoginResponse, UserServiceResponse } from '../types';

const KAFKA_TIMEOUT_MS = 10_000;

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject('TOURNAMENT_SERVICE') private readonly client: ClientKafka,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.client.subscribeToResponseOf('auth.login');
  }

  async login(playerId: string): Promise<LoginResponse> {
    try {
      const result = await lastValueFrom<UserServiceResponse>(
        this.client.send<UserServiceResponse>('auth.login', { playerId }).pipe(
          timeout(KAFKA_TIMEOUT_MS),
        ),
      );
      if (!result.success || !result.user) {
        throw new UnauthorizedException('Invalid player ID');
      }
      const payload = { sub: result.user.id, name: result.user.name };
      return {
        access_token: this.jwtService.sign(payload),
        user: result.user,
      };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
