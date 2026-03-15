import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;

  const mockKafkaClient = {
    send: jest.fn(),
    connect: jest.fn(),
    subscribeToResponseOf: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'TOURNAMENT_SERVICE', useValue: mockKafkaClient },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return token on successful login', async () => {
      mockKafkaClient.send.mockReturnValue(
        of({ success: true, user: { id: 'player-1', name: 'Alice' } }),
      );

      const result = await service.login('player-1');
      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: { id: 'player-1', name: 'Alice' },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: 'player-1', name: 'Alice' });
    });

    it('should throw on invalid player', async () => {
      mockKafkaClient.send.mockReturnValue(
        of({ success: false, error: 'User not found' }),
      );

      await expect(service.login('invalid')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw on transport error', async () => {
      mockKafkaClient.send.mockReturnValue(
        throwError(() => new Error('connection failed')),
      );

      await expect(service.login('player-1')).rejects.toThrow(UnauthorizedException);
    });
  });
});
