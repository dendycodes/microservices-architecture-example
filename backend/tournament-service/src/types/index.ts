export { GameType, TournamentType, TournamentStatus } from './enums';
import { GameType, TournamentType, TournamentStatus } from './enums';

export interface JoinTournamentData {
  playerId: string;
  gameType: GameType;
  tournamentType: TournamentType;
  entryFee: number;
}

export interface TournamentFilters {
  gameType?: GameType;
  tournamentType?: TournamentType;
  page?: string;
  limit?: string;
}

export interface TournamentListItem {
  id: string;
  gameType: GameType;
  tournamentType: TournamentType;
  entryFee: number;
  status: TournamentStatus;
  maxPlayers: number;
  createdAt: Date;
  playersCount: number;
}

export interface PaginatedTournaments {
  data: TournamentListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface JoinTournamentResult {
  success: boolean;
  error?: string;
  tournament?: Record<string, unknown>;
}

export interface ServiceErrorResult {
  success: false;
  error: string;
}

export interface UserServiceResponse {
  success: boolean;
  error?: string;
  user?: { id: string; name: string };
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: { id: string; name: string };
}
