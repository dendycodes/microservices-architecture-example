import { Injectable } from '@nestjs/common';

export interface User {
  id: string;
  name: string;
  balance: number;
  country: string;
}

@Injectable()
export class UserService {
  private readonly users: User[] = [
    { id: 'player-1', name: 'Alice Johnson', balance: 1000, country: 'US' },
    { id: 'player-2', name: 'Bob Smith', balance: 500, country: 'UK' },
    { id: 'player-3', name: 'Charlie Brown', balance: 750, country: 'DE' },
    { id: 'player-4', name: 'Diana Prince', balance: 1200, country: 'FR' },
    { id: 'player-5', name: 'Eve Wilson', balance: 300, country: 'JP' },
  ];

  findById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  findAll(): User[] {
    return this.users;
  }
}
