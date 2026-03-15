import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum GameType {
  CHESS = 'chess',
  POKER = 'poker',
  BACKGAMMON = 'backgammon',
  GO = 'go',
}

export enum TournamentType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class JoinTournamentDto {
  @IsString()
  @IsOptional()
  playerId?: string;

  @IsEnum(GameType)
  @IsNotEmpty()
  gameType!: GameType;

  @IsEnum(TournamentType)
  @IsNotEmpty()
  tournamentType!: TournamentType;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  entryFee!: number;
}
