import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { JoinTournamentDto } from './dto/join-tournament.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest, TournamentFilters } from '../types';

@Controller('tournaments')
@UseGuards(JwtAuthGuard)
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post('join')
  async joinTournament(
    @Body() dto: JoinTournamentDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<unknown> {
    const playerId = dto.playerId || req.user?.playerId;
    if (!playerId) {
      throw new BadRequestException('playerId is required');
    }
    return this.tournamentService.joinTournament({ ...dto, playerId });
  }

  @Get()
  async getTournaments(
    @Query('gameType') gameType?: string,
    @Query('tournamentType') tournamentType?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<unknown> {
    const filters: TournamentFilters = {};
    if (gameType) filters.gameType = gameType;
    if (tournamentType) filters.tournamentType = tournamentType;
    if (page) filters.page = page;
    if (limit) filters.limit = limit;
    return this.tournamentService.getTournaments(filters);
  }

  @Get('my-tournaments')
  async getMyTournaments(
    @Query('playerId') playerId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<unknown> {
    const resolvedPlayerId = playerId || req.user?.playerId;
    if (!resolvedPlayerId) {
      throw new BadRequestException('playerId is required');
    }
    return this.tournamentService.getMyTournaments(resolvedPlayerId);
  }

  @Get(':id')
  async getTournamentDetails(@Param('id') id: string): Promise<unknown> {
    return this.tournamentService.getTournamentDetails(id);
  }
}
