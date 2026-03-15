export interface JwtPayload {
  sub: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  playerId: string;
  name: string;
}

export interface AuthenticatedRequest {
  user: AuthenticatedUser;
}

export interface LoginResponse {
  access_token: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  name: string;
  balance: number;
  country: string;
}

export interface UserServiceResponse {
  success: boolean;
  error?: string;
  user?: UserInfo;
}

export interface TournamentFilters {
  gameType?: string;
  tournamentType?: string;
  page?: string;
  limit?: string;
}

export interface TournamentListItem {
  id: string;
  gameType: string;
  tournamentType: string;
  entryFee: number;
  status: string;
  maxPlayers: number;
  createdAt: string;
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
  tournament?: TournamentListItem & { playersCount: number };
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
