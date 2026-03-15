import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TournamentService } from './tournament.service';
import {
  JoinTournamentData,
  TournamentFilters,
  JoinTournamentResult,
  PaginatedTournaments,
  ServiceErrorResult,
  AuthResult,
} from '../types';
import { Tournament } from '../entities/tournament.entity';

@Controller()
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @MessagePattern('tournament.join')
  async joinTournament(@Payload() data: JoinTournamentData): Promise<JoinTournamentResult> {
    return this.tournamentService.joinTournament(data);
  }

  @MessagePattern('tournament.list')
  async getTournaments(@Payload() data: TournamentFilters): Promise<PaginatedTournaments | ServiceErrorResult> {
    return this.tournamentService.getTournaments(data);
  }

  @MessagePattern('tournament.my-tournaments')
  async getMyTournaments(@Payload() data: { playerId: string }): Promise<Tournament[] | ServiceErrorResult> {
    return this.tournamentService.getMyTournaments(data.playerId);
  }

  @MessagePattern('tournament.details')
  async getTournamentDetails(@Payload() data: { id: string }): Promise<Tournament | ServiceErrorResult> {
    return this.tournamentService.getTournamentDetails(data.id);
  }

  @MessagePattern('auth.login')
  async login(@Payload() data: { playerId: string }): Promise<AuthResult> {
    return this.tournamentService.authenticateUser(data.playerId);
  }
}
