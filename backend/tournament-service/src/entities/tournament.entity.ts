import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { TournamentPlayer } from './tournament-player.entity';

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  gameType!: string;

  @Column()
  tournamentType!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  entryFee!: number;

  @Column({ default: 'open' })
  status!: string;

  @Column({ default: 8 })
  maxPlayers!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => TournamentPlayer, (tp) => tp.tournament, { cascade: true })
  players!: TournamentPlayer[];
}
