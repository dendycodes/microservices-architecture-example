import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserService, User } from './user.service';

interface UserResponse {
  success: boolean;
  error?: string;
  user?: User;
}

interface UserListResponse {
  success: boolean;
  users: User[];
}

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.get')
  getUser(data: { id: string }): UserResponse {
    const user = this.userService.findById(data.id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    return { success: true, user };
  }

  @MessagePattern('user.login')
  login(data: { id: string }): UserResponse {
    const user = this.userService.findById(data.id);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    return { success: true, user };
  }

  @MessagePattern('user.list')
  listUsers(): UserListResponse {
    return { success: true, users: this.userService.findAll() };
  }
}
