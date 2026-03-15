import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { TournamentService } from './tournament.service';
import { Tournament } from '../entities/tournament.entity';
import { TournamentPlayer } from '../entities/tournament-player.entity';
import { JoinTournamentData } from '../types';

describe('TournamentService', () => {
  let service: TournamentService;

  const mockTournamentRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockPlayerRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  };

  const mockNatsClient = {
    send: jest.fn(),
    connect: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentService,
        { provide: getRepositoryToken(Tournament), useValue: mockTournamentRepo },
        { provide: getRepositoryToken(TournamentPlayer), useValue: mockPlayerRepo },
        { provide: 'USER_SERVICE', useValue: mockNatsClient },
      ],
    }).compile();

    service = module.get<TournamentService>(TournamentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('joinTournament', () => {
    const joinData: JoinTournamentData = { playerId: 'player-1', gameType: 'chess', tournamentType: 'daily', entryFee: 10 };

    it('should return error if user not found', async () => {
      mockNatsClient.send.mockReturnValue(of({ success: false }));

      const result = await service.joinTournament(joinData);
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });

    it('should create tournament if none exists and add player', async () => {
      mockNatsClient.send.mockReturnValue(of({ success: true, user: { id: 'player-1' } }));

      const qb = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };
      mockTournamentRepo.createQueryBuilder.mockReturnValue(qb);

      const newTournament = { id: 'new-uuid', ...joinData };
      mockTournamentRepo.create.mockReturnValue(newTournament);
      mockTournamentRepo.save.mockResolvedValue(newTournament);
      mockPlayerRepo.findOne.mockResolvedValue(null);
      mockPlayerRepo.create.mockReturnValue({ tournamentId: 'new-uuid', playerId: 'player-1' });
      mockPlayerRepo.save.mockResolvedValue({});
      mockPlayerRepo.count.mockResolvedValue(1);

      const result = await service.joinTournament(joinData);
      expect(result.success).toBe(true);
      expect(mockTournamentRepo.create).toHaveBeenCalled();
      expect(mockPlayerRepo.save).toHaveBeenCalled();
    });

    it('should join existing tournament', async () => {
      mockNatsClient.send.mockReturnValue(of({ success: true, user: { id: 'player-1' } }));

      const existingTournament = { id: 'existing-uuid', gameType: 'chess' };
      const qb = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(existingTournament),
      };
      mockTournamentRepo.createQueryBuilder.mockReturnValue(qb);
      mockPlayerRepo.findOne.mockResolvedValue(null);
      mockPlayerRepo.create.mockReturnValue({ tournamentId: 'existing-uuid', playerId: 'player-1' });
      mockPlayerRepo.save.mockResolvedValue({});
      mockPlayerRepo.count.mockResolvedValue(2);

      const result = await service.joinTournament(joinData);
      expect(result.success).toBe(true);
      expect(mockTournamentRepo.create).not.toHaveBeenCalled();
    });

    it('should prevent duplicate joins', async () => {
      mockNatsClient.send.mockReturnValue(of({ success: true, user: { id: 'player-1' } }));

      const existingTournament = { id: 'existing-uuid', gameType: 'chess' };
      const qb = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        having: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(existingTournament),
      };
      mockTournamentRepo.createQueryBuilder.mockReturnValue(qb);
      mockPlayerRepo.findOne.mockResolvedValue({ id: 'existing-join' });

      const result = await service.joinTournament(joinData);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Player already joined this tournament');
    });
  });

  describe('getTournamentDetails', () => {
    it('should return tournament with players', async () => {
      const tournament = { id: 'uuid-1', gameType: 'chess', players: [] };
      mockTournamentRepo.findOne.mockResolvedValue(tournament);

      const result = await service.getTournamentDetails('uuid-1');
      expect(result).toEqual(tournament);
    });

    it('should return error when not found', async () => {
      mockTournamentRepo.findOne.mockResolvedValue(null);

      const result = await service.getTournamentDetails('non-existent');
      expect(result).toEqual({ success: false, error: 'Tournament not found' });
    });
  });

  describe('getMyTournaments', () => {
    it('should return tournaments for player', async () => {
      const entries = [
        { tournament: { id: '1', gameType: 'chess' } },
        { tournament: { id: '2', gameType: 'poker' } },
      ];
      mockPlayerRepo.find.mockResolvedValue(entries);

      const result = await service.getMyTournaments('player-1');
      expect(result).toHaveLength(2);
    });

    it('should return empty array for player with no tournaments', async () => {
      mockPlayerRepo.find.mockResolvedValue([]);

      const result = await service.getMyTournaments('player-99');
      expect(result).toHaveLength(0);
    });
  });

  describe('authenticateUser', () => {
    it('should forward NATS response', async () => {
      mockNatsClient.send.mockReturnValue(of({ success: true, user: { id: 'player-1' } }));

      const result = await service.authenticateUser('player-1');
      expect(result).toEqual({ success: true, user: { id: 'player-1' } });
    });
  });
});
