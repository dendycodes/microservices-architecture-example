import { Test, TestingModule } from '@nestjs/testing';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';
import { JoinTournamentDto } from './dto/join-tournament.dto';
import { AuthenticatedRequest } from '../types';

describe('TournamentController', () => {
  let controller: TournamentController;

  const mockTournamentService = {
    joinTournament: jest.fn(),
    getTournaments: jest.fn(),
    getMyTournaments: jest.fn(),
    getTournamentDetails: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TournamentController],
      providers: [
        { provide: TournamentService, useValue: mockTournamentService },
      ],
    }).compile();

    controller = module.get<TournamentController>(TournamentController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('joinTournament', () => {
    it('should call service with body playerId', async () => {
      const dto: JoinTournamentDto = { playerId: 'player-1', gameType: 'chess', tournamentType: 'daily', entryFee: 10 };
      const mockReq = { user: { playerId: 'player-1', name: 'Alice' } } as AuthenticatedRequest;
      mockTournamentService.joinTournament.mockResolvedValue({ success: true });

      const result = await controller.joinTournament(dto, mockReq);
      expect(result).toEqual({ success: true });
      expect(mockTournamentService.joinTournament).toHaveBeenCalledWith(dto);
    });

    it('should derive playerId from JWT when not in body', async () => {
      const dto = { gameType: 'chess', tournamentType: 'daily', entryFee: 10 } as JoinTournamentDto;
      const mockReq = { user: { playerId: 'player-2', name: 'Bob' } } as AuthenticatedRequest;
      mockTournamentService.joinTournament.mockResolvedValue({ success: true });

      await controller.joinTournament(dto, mockReq);
      expect(mockTournamentService.joinTournament).toHaveBeenCalledWith(
        expect.objectContaining({ playerId: 'player-2' }),
      );
    });
  });

  describe('getTournaments', () => {
    it('should return paginated tournaments', async () => {
      const mockData = { data: [{ id: '1', gameType: 'chess' }], total: 1, page: 1, limit: 10, totalPages: 1 };
      mockTournamentService.getTournaments.mockResolvedValue(mockData);

      const result = await controller.getTournaments(undefined, undefined, undefined, undefined);
      expect(result).toEqual(mockData);
    });

    it('should pass filters to service', async () => {
      await controller.getTournaments('chess', 'daily', undefined, undefined);
      expect(mockTournamentService.getTournaments).toHaveBeenCalledWith({
        gameType: 'chess',
        tournamentType: 'daily',
      });
    });
  });

  describe('getMyTournaments', () => {
    it('should use query param playerId', async () => {
      const mockReq = { user: { playerId: 'player-1', name: 'Alice' } } as AuthenticatedRequest;
      mockTournamentService.getMyTournaments.mockResolvedValue([]);

      await controller.getMyTournaments('player-1', mockReq);
      expect(mockTournamentService.getMyTournaments).toHaveBeenCalledWith('player-1');
    });

    it('should fall back to JWT playerId', async () => {
      const mockReq = { user: { playerId: 'player-3', name: 'Charlie' } } as AuthenticatedRequest;
      mockTournamentService.getMyTournaments.mockResolvedValue([]);

      await controller.getMyTournaments('', mockReq);
      expect(mockTournamentService.getMyTournaments).toHaveBeenCalledWith('player-3');
    });
  });

  describe('getTournamentDetails', () => {
    it('should return tournament details', async () => {
      const mock = { id: 'uuid-1', gameType: 'chess', players: [] };
      mockTournamentService.getTournamentDetails.mockResolvedValue(mock);

      const result = await controller.getTournamentDetails('uuid-1');
      expect(result).toEqual(mock);
    });
  });
});
