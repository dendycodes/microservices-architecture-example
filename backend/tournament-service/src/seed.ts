import { DataSource } from 'typeorm';
import { Tournament } from './entities/tournament.entity';
import { TournamentPlayer } from './entities/tournament-player.entity';

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
    { gameType: 'chess', tournamentType: 'daily', entryFee: 10, status: 'open', maxPlayers: 8 },
    { gameType: 'chess', tournamentType: 'weekly', entryFee: 50, status: 'open', maxPlayers: 16 },
    { gameType: 'chess', tournamentType: 'monthly', entryFee: 100, status: 'open', maxPlayers: 32 },
    { gameType: 'poker', tournamentType: 'daily', entryFee: 20, status: 'open', maxPlayers: 8 },
    { gameType: 'poker', tournamentType: 'weekly', entryFee: 100, status: 'open', maxPlayers: 16 },
    { gameType: 'backgammon', tournamentType: 'daily', entryFee: 5, status: 'open', maxPlayers: 8 },
    { gameType: 'backgammon', tournamentType: 'weekly', entryFee: 25, status: 'open', maxPlayers: 12 },
    { gameType: 'go', tournamentType: 'daily', entryFee: 15, status: 'open', maxPlayers: 8 },
    { gameType: 'go', tournamentType: 'monthly', entryFee: 200, status: 'open', maxPlayers: 64 },
    { gameType: 'chess', tournamentType: 'daily', entryFee: 10, status: 'open', maxPlayers: 2 },
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
      tournament.status = 'full';
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
