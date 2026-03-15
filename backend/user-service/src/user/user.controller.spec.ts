import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it('should return user when found', () => {
      const result = controller.getUser({ id: 'player-1' });
      expect(result).toEqual({
        success: true,
        user: expect.objectContaining({ id: 'player-1', name: 'Alice Johnson' }),
      });
    });

    it('should return error when user not found', () => {
      const result = controller.getUser({ id: 'non-existent' });
      expect(result).toEqual({
        success: false,
        error: 'User not found',
      });
    });
  });

  describe('login', () => {
    it('should return user on successful login', () => {
      const result = controller.login({ id: 'player-2' });
      expect(result).toEqual({
        success: true,
        user: expect.objectContaining({ id: 'player-2', name: 'Bob Smith' }),
      });
    });

    it('should return error for invalid player', () => {
      const result = controller.login({ id: 'invalid' });
      expect(result).toEqual({
        success: false,
        error: 'User not found',
      });
    });
  });

  describe('listUsers', () => {
    it('should return all users', () => {
      const result = controller.listUsers();
      expect(result.success).toBe(true);
      expect(result.users).toHaveLength(5);
    });
  });
});
