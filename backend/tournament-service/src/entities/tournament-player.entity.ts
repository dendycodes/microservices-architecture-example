import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Tournament } from './tournament.entity';

@Entity('tournament_players')
@Unique(['tournamentId', 'playerId'])
export class TournamentPlayer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  tournamentId!: string;

  @Column()
  playerId!: string;

  @CreateDateColumn()
  joinedAt!: Date;

  @ManyToOne(() => Tournament, (t) => t.players)
  @JoinColumn({ name: 'tournamentId' })
  tournament!: Tournament;
}
