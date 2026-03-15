import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class JoinTournamentDto {
  @IsString()
  @IsOptional()
  playerId?: string;

  @IsString()
  @IsNotEmpty()
  gameType!: string;

  @IsString()
  @IsNotEmpty()
  tournamentType!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  entryFee!: number;
}
