import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user when valid ID is provided', () => {
      const user = service.findById('player-1');
      expect(user).toBeDefined();
      expect(user?.id).toBe('player-1');
      expect(user?.name).toBe('Alice Johnson');
      expect(user?.balance).toBe(1000);
      expect(user?.country).toBe('US');
    });

    it('should return undefined for non-existent user', () => {
      const user = service.findById('non-existent');
      expect(user).toBeUndefined();
    });

    it('should find all hardcoded users', () => {
      expect(service.findById('player-1')).toBeDefined();
      expect(service.findById('player-2')).toBeDefined();
      expect(service.findById('player-3')).toBeDefined();
      expect(service.findById('player-4')).toBeDefined();
      expect(service.findById('player-5')).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all users', () => {
      const users = service.findAll();
      expect(users).toHaveLength(5);
    });

    it('should return users with correct structure', () => {
      const users = service.findAll();
      users.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('balance');
        expect(user).toHaveProperty('country');
      });
    });
  });
});
