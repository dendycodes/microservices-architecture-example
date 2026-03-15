import {
  Inject,
  Injectable,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import { JoinTournamentDto } from './dto/join-tournament.dto';
import { TournamentFilters } from '../types';

const KAFKA_TIMEOUT_MS = 10_000;

@Injectable()
export class TournamentService implements OnModuleInit {
  constructor(
    @Inject('TOURNAMENT_SERVICE') private readonly client: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    this.client.subscribeToResponseOf('tournament.join');
    this.client.subscribeToResponseOf('tournament.list');
    this.client.subscribeToResponseOf('tournament.my-tournaments');
    this.client.subscribeToResponseOf('tournament.details');
    await this.client.connect();
  }

  async joinTournament(dto: JoinTournamentDto): Promise<unknown> {
    try {
      return await lastValueFrom(
        this.client.send('tournament.join', dto).pipe(timeout(KAFKA_TIMEOUT_MS)),
      );
    } catch (_error: unknown) {
      throw new HttpException(
        'Failed to join tournament',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTournaments(filters?: TournamentFilters): Promise<unknown> {
    try {
      return await lastValueFrom(
        this.client.send('tournament.list', filters || {}).pipe(timeout(KAFKA_TIMEOUT_MS)),
      );
    } catch (_error: unknown) {
      throw new HttpException(
        'Failed to fetch tournaments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getMyTournaments(playerId: string): Promise<unknown> {
    try {
      return await lastValueFrom(
        this.client.send('tournament.my-tournaments', { playerId }).pipe(timeout(KAFKA_TIMEOUT_MS)),
      );
    } catch (_error: unknown) {
      throw new HttpException(
        'Failed to fetch player tournaments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTournamentDetails(id: string): Promise<unknown> {
    try {
      return await lastValueFrom(
        this.client.send('tournament.details', { id }).pipe(timeout(KAFKA_TIMEOUT_MS)),
      );
    } catch (_error: unknown) {
      throw new HttpException(
        'Failed to fetch tournament details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
