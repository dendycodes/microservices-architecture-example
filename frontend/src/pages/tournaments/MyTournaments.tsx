import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Alert, Chip, useMediaQuery, useTheme,
} from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useMyTournaments } from '../../hooks/useMyTournaments';
import { TableSkeleton } from '../../components/TableSkeleton';

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

const statusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'open': return 'success';
    case 'in_progress': return 'warning';
    case 'completed': return 'error';
    default: return 'default';
  }
};

export function MyTournaments() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const user = useSelector((state: RootState) => state.auth.user);
  const playerId = user?.id || '';
  const { data: tournaments, isLoading, error } = useMyTournaments(playerId);

  return (
    <Box sx={{ p: { xs: 2, sm: 3.5 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.85rem' } }}>
          My Tournaments
        </Typography>
        <Typography variant="body2">
          Tournaments joined by <strong style={{ color: '#1a2027' }}>{user?.name || playerId}</strong>
        </Typography>
      </Box>

      {isLoading && <TableSkeleton columns={4} rows={5} size={isMobile ? 'small' : 'medium'} />}
      {!!error && <Alert severity="error">Failed to load your tournaments</Alert>}
      {!isLoading && !error && tournaments?.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SportsEsportsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">No tournaments yet</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Head to Available Tournaments to join your first one!
          </Typography>
        </Paper>
      )}

      {tournaments && tournaments.length > 0 && (
        <Paper>
          <TableContainer>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Game</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Entry Fee</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tournaments.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {capitalize(t.gameType)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={capitalize(t.tournamentType)}
                        size="small"
                        sx={{ bgcolor: '#eef2f7', color: 'text.primary', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        ${t.entryFee}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={capitalize(t.status)}
                        color={statusColor(t.status)}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: '6px' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
