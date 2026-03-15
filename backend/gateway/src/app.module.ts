import { Module } from '@nestjs/common';
import { TournamentModule } from './tournament/tournament.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, TournamentModule],
})
export class AppModule {}
