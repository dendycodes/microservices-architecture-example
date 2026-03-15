import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Tournament } from '../entities/tournament.entity';
import { TournamentPlayer } from '../entities/tournament-player.entity';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tournament, TournamentPlayer]),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.NATS,
        options: { servers: [process.env.NATS_URL || 'nats://nats:4222'] },
      },
    ]),
  ],
  controllers: [TournamentController],
  providers: [TournamentService],
})
export class TournamentModule {}
