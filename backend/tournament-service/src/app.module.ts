import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TournamentModule } from './tournament/tournament.module';
import { Tournament } from './entities/tournament.entity';
import { TournamentPlayer } from './entities/tournament-player.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'tournaments',
      entities: [Tournament, TournamentPlayer],
      synchronize: true,
    }),
    TournamentModule,
  ],
})
export class AppModule {}
