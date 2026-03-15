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

export enum TournamentStatus {
  OPEN = 'open',
  FULL = 'full',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export interface Tournament {
  id: string;
  gameType: GameType;
  tournamentType: TournamentType;
  entryFee: number;
  status: TournamentStatus;
  maxPlayers: number;
  playersCount: number;
  createdAt: string;
}

export interface PaginatedResponse {
  data: Tournament[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TournamentPlayer {
  id: string;
  playerId: string;
  joinedAt: string;
}

export interface TournamentDetails {
  id: string;
  gameType: GameType;
  tournamentType: TournamentType;
  entryFee: number;
  status: TournamentStatus;
  maxPlayers: number;
  createdAt: string;
  players: TournamentPlayer[];
}

export interface JoinTournamentPayload {
  playerId: string;
  gameType: GameType;
  tournamentType: TournamentType;
  entryFee: number;
}

export interface UserInfo {
  id: string;
  name: string;
  balance: number;
  country: string;
}

export interface LoginResponse {
  access_token: string;
  user: UserInfo;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export interface PlayerOption {
  id: string;
  name: string;
}

export interface CrudFilter {
  field: string;
  operator: string;
  value: string;
}
