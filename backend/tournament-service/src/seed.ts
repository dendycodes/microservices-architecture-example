import { DataSource } from 'typeorm';
import { Tournament } from './entities/tournament.entity';
import { TournamentPlayer } from './entities/tournament-player.entity';
import { GameType, TournamentType, TournamentStatus } from './types/enums';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'tournaments',
  entities: [Tournament, TournamentPlayer],
  synchronize: true,
});

async function seed(): Promise<void> {
  await dataSource.initialize();
  console.log('Database connected. Seeding...');

  const tournamentRepo = dataSource.getRepository(Tournament);
  const playerRepo = dataSource.getRepository(TournamentPlayer);

  const existingCount = await tournamentRepo.count();
  if (existingCount > 0) {
    console.log(`Database already has ${existingCount} tournaments. Skipping seed.`);
    await dataSource.destroy();
    return;
  }

  const tournaments = await tournamentRepo.save([
    { gameType: GameType.CHESS, tournamentType: TournamentType.DAILY, entryFee: 10, status: TournamentStatus.OPEN, maxPlayers: 8 },
    { gameType: GameType.CHESS, tournamentType: TournamentType.WEEKLY, entryFee: 50, status: TournamentStatus.OPEN, maxPlayers: 16 },
    { gameType: GameType.CHESS, tournamentType: TournamentType.MONTHLY, entryFee: 100, status: TournamentStatus.OPEN, maxPlayers: 32 },
    { gameType: GameType.POKER, tournamentType: TournamentType.DAILY, entryFee: 20, status: TournamentStatus.OPEN, maxPlayers: 8 },
    { gameType: GameType.POKER, tournamentType: TournamentType.WEEKLY, entryFee: 100, status: TournamentStatus.OPEN, maxPlayers: 16 },
    { gameType: GameType.BACKGAMMON, tournamentType: TournamentType.DAILY, entryFee: 5, status: TournamentStatus.OPEN, maxPlayers: 8 },
    { gameType: GameType.BACKGAMMON, tournamentType: TournamentType.WEEKLY, entryFee: 25, status: TournamentStatus.OPEN, maxPlayers: 12 },
    { gameType: GameType.GO, tournamentType: TournamentType.DAILY, entryFee: 15, status: TournamentStatus.OPEN, maxPlayers: 8 },
    { gameType: GameType.GO, tournamentType: TournamentType.MONTHLY, entryFee: 200, status: TournamentStatus.OPEN, maxPlayers: 64 },
    { gameType: GameType.CHESS, tournamentType: TournamentType.DAILY, entryFee: 10, status: TournamentStatus.OPEN, maxPlayers: 2 },
  ]);

  console.log(`Created ${tournaments.length} tournaments`);

  const playerEntries = [
    { tournamentId: tournaments[0].id, playerId: 'player-1' },
    { tournamentId: tournaments[0].id, playerId: 'player-2' },
    { tournamentId: tournaments[0].id, playerId: 'player-3' },
    { tournamentId: tournaments[1].id, playerId: 'player-1' },
    { tournamentId: tournaments[1].id, playerId: 'player-4' },
    { tournamentId: tournaments[3].id, playerId: 'player-2' },
    { tournamentId: tournaments[3].id, playerId: 'player-5' },
    { tournamentId: tournaments[4].id, playerId: 'player-1' },
    { tournamentId: tournaments[4].id, playerId: 'player-3' },
    { tournamentId: tournaments[4].id, playerId: 'player-5' },
    { tournamentId: tournaments[5].id, playerId: 'player-4' },
    { tournamentId: tournaments[7].id, playerId: 'player-2' },
    { tournamentId: tournaments[9].id, playerId: 'player-1' },
    { tournamentId: tournaments[9].id, playerId: 'player-2' },
  ];

  const savedPlayers = await playerRepo.save(playerEntries);
  console.log(`Created ${savedPlayers.length} tournament player entries`);

  // Update status to 'full' for tournaments that reached max capacity
  for (const tournament of tournaments) {
    const count = await playerRepo.count({ where: { tournamentId: tournament.id } });
    if (count >= tournament.maxPlayers) {
      (tournament as Tournament).status = TournamentStatus.FULL;
      await tournamentRepo.save(tournament);
      console.log(`Tournament ${tournament.gameType}/${tournament.tournamentType} marked as full (${count}/${tournament.maxPlayers})`);
    }
  }

  console.log('Seed completed successfully!');
  await dataSource.destroy();
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
