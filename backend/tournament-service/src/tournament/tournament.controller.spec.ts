import { Test, TestingModule } from '@nestjs/testing';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';
import { JoinTournamentData, TournamentFilters, GameType, TournamentType } from '../types';

describe('TournamentController', () => {
  let controller: TournamentController;

  const mockTournamentService = {
    joinTournament: jest.fn(),
    getTournaments: jest.fn(),
    getMyTournaments: jest.fn(),
    getTournamentDetails: jest.fn(),
    authenticateUser: jest.fn(),
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
    it('should delegate to service', async () => {
      const data: JoinTournamentData = { playerId: 'player-1', gameType: GameType.CHESS, tournamentType: TournamentType.DAILY, entryFee: 10 };
      mockTournamentService.joinTournament.mockResolvedValue({ success: true });

      const result = await controller.joinTournament(data);
      expect(result).toEqual({ success: true });
      expect(mockTournamentService.joinTournament).toHaveBeenCalledWith(data);
    });
  });

  describe('getTournaments', () => {
    it('should delegate with filters', async () => {
      const filters: TournamentFilters = { gameType: GameType.CHESS };
      mockTournamentService.getTournaments.mockResolvedValue({ data: [], total: 0 });

      await controller.getTournaments(filters);
      expect(mockTournamentService.getTournaments).toHaveBeenCalledWith(filters);
    });
  });

  describe('getMyTournaments', () => {
    it('should pass playerId to service', async () => {
      mockTournamentService.getMyTournaments.mockResolvedValue([]);

      await controller.getMyTournaments({ playerId: 'player-1' });
      expect(mockTournamentService.getMyTournaments).toHaveBeenCalledWith('player-1');
    });
  });

  describe('getTournamentDetails', () => {
    it('should pass id to service', async () => {
      mockTournamentService.getTournamentDetails.mockResolvedValue({ id: 'uuid-1' });

      await controller.getTournamentDetails({ id: 'uuid-1' });
      expect(mockTournamentService.getTournamentDetails).toHaveBeenCalledWith('uuid-1');
    });
  });

  describe('login', () => {
    it('should delegate to authenticateUser', async () => {
      mockTournamentService.authenticateUser.mockResolvedValue({ success: true });

      await controller.login({ playerId: 'player-1' });
      expect(mockTournamentService.authenticateUser).toHaveBeenCalledWith('player-1');
    });
  });
});
