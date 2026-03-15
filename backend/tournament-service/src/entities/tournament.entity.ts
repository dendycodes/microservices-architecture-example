import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { TournamentPlayer } from './tournament-player.entity';
import { GameType, TournamentType, TournamentStatus } from '../types/enums';

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  gameType!: GameType;

  @Column()
  tournamentType!: TournamentType;

  @Column('decimal', { precision: 10, scale: 2 })
  entryFee!: number;

  @Column({ default: TournamentStatus.OPEN })
  status!: TournamentStatus;

  @Column({ default: 8 })
  maxPlayers!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => TournamentPlayer, (tp) => tp.tournament, { cascade: true })
  players!: TournamentPlayer[];
}
