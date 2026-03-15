import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Tournament } from '../entities/tournament.entity';
import { TournamentPlayer } from '../entities/tournament-player.entity';
import {
  JoinTournamentData,
  TournamentFilters,
  PaginatedTournaments,
  JoinTournamentResult,
  ServiceErrorResult,
  UserServiceResponse,
  AuthResult,
} from '../types';

@Injectable()
export class TournamentService implements OnModuleInit {
  constructor(
    @InjectRepository(Tournament)
    private tournamentRepo: Repository<Tournament>,
    @InjectRepository(TournamentPlayer)
    private playerRepo: Repository<TournamentPlayer>,
    @Inject('USER_SERVICE') private natsClient: ClientProxy,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.natsClient.connect();
  }

  async joinTournament(data: JoinTournamentData): Promise<JoinTournamentResult> {
    try {
      const userResponse = await lastValueFrom<UserServiceResponse>(
        this.natsClient.send('user.get', { id: data.playerId }),
      );
      if (!userResponse.success) {
        return { success: false, error: 'User not found' };
      }

      let tournament = await this.tournamentRepo
        .createQueryBuilder('t')
        .leftJoin('t.players', 'p')
        .where('t.gameType = :gameType', { gameType: data.gameType })
        .andWhere('t.tournamentType = :tournamentType', { tournamentType: data.tournamentType })
        .andWhere('t.entryFee = :entryFee', { entryFee: data.entryFee })
        .andWhere('t.status = :status', { status: 'open' })
        .groupBy('t.id')
        .having('COUNT(p.id) < t."maxPlayers"')
        .getOne();

      if (!tournament) {
        tournament = this.tournamentRepo.create({
          gameType: data.gameType,
          tournamentType: data.tournamentType,
          entryFee: data.entryFee,
        });
        tournament = await this.tournamentRepo.save(tournament);
      }

      const existing = await this.playerRepo.findOne({
        where: { tournamentId: tournament.id, playerId: data.playerId },
      });
      if (existing) {
        return { success: false, error: 'Player already joined this tournament' };
      }

      const tp = this.playerRepo.create({
        tournamentId: tournament.id,
        playerId: data.playerId,
      });
      await this.playerRepo.save(tp);

      const playersCount = await this.playerRepo.count({ where: { tournamentId: tournament.id } });

      if (playersCount >= tournament.maxPlayers && tournament.status === 'open') {
        tournament.status = 'full';
        await this.tournamentRepo.save(tournament);
      }

      return {
        success: true,
        tournament: { ...tournament, entryFee: Number(tournament.entryFee), playersCount },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to join tournament';
      return { success: false, error: message };
    }
  }

  async getTournaments(filters?: TournamentFilters): Promise<PaginatedTournaments | ServiceErrorResult> {
    try {
      const page = parseInt(String(filters?.page || '1')) || 1;
      const limit = parseInt(String(filters?.limit || '10')) || 10;
      const skip = (page - 1) * limit;

      const where: FindOptionsWhere<Tournament> = {};
      if (filters?.gameType) where.gameType = filters.gameType;
      if (filters?.tournamentType) where.tournamentType = filters.tournamentType;

      const [tournaments, total] = await this.tournamentRepo.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
        relations: ['players'],
      });

      return {
        data: tournaments.map((t) => {
          const playersCount = t.players?.length || 0;
          let status = t.status;
          if (status === 'open' && playersCount >= t.maxPlayers) {
            status = 'full';
          }
          return {
            id: t.id,
            gameType: t.gameType,
            tournamentType: t.tournamentType,
            entryFee: Number(t.entryFee),
            status,
            maxPlayers: t.maxPlayers,
            createdAt: t.createdAt,
            playersCount,
          };
        }),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tournaments';
      return { success: false, error: message };
    }
  }

  async getMyTournaments(playerId: string): Promise<Tournament[] | ServiceErrorResult> {
    try {
      const entries = await this.playerRepo.find({
        where: { playerId },
        relations: ['tournament'],
      });
      return entries.map((e) => e.tournament);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tournaments';
      return { success: false, error: message };
    }
  }

  async getTournamentDetails(id: string): Promise<Tournament | ServiceErrorResult> {
    try {
      const tournament = await this.tournamentRepo.findOne({
        where: { id },
        relations: ['players'],
      });
      if (!tournament) {
        return { success: false, error: 'Tournament not found' };
      }
      return tournament;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tournament';
      return { success: false, error: message };
    }
  }

  async authenticateUser(playerId: string): Promise<AuthResult> {
    try {
      const userResponse = await lastValueFrom<UserServiceResponse>(
        this.natsClient.send('user.login', { id: playerId }),
      );
      return userResponse;
    } catch (_error: unknown) {
      return { success: false, error: 'Authentication failed' };
    }
  }
}
