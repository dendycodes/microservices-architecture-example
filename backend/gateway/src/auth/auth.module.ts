import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'tournament-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    KafkaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, JwtStrategy],
})
export class AuthModule {}
