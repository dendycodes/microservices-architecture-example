export interface Tournament {
  id: string;
  gameType: string;
  tournamentType: string;
  entryFee: number;
  status: string;
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
  gameType: string;
  tournamentType: string;
  entryFee: number;
  status: string;
  maxPlayers: number;
  createdAt: string;
  players: TournamentPlayer[];
}

export interface JoinTournamentPayload {
  playerId: string;
  gameType: string;
  tournamentType: string;
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
