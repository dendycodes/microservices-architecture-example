import { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Chip, Alert, FormControl, InputLabel, Select, MenuItem, Stack,
  Dialog, DialogContent, DialogActions, Drawer, List, ListItem,
  ListItemText, ListItemAvatar, Avatar, Divider,
  Snackbar, TablePagination, useMediaQuery, useTheme, IconButton, Tooltip, Zoom,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LinearProgress from '@mui/material/LinearProgress';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setSelectedGameType, setSelectedTournamentType } from '../../store/uiSlice';
import { useTournaments } from '../../hooks/useTournaments';
import { useMyTournaments } from '../../hooks/useMyTournaments';
import { useJoinTournament } from '../../hooks/useJoinTournament';
import { useTournamentDetails } from '../../hooks/useTournamentDetails';
import { SnackbarState, Tournament } from '../../types';
import { TableSkeleton } from '../../components/TableSkeleton';
import { DetailsSkeleton } from '../../components/DetailsSkeleton';

const gameTypes = ['chess', 'poker', 'backgammon', 'go'];
const tournamentTypes = ['daily', 'weekly', 'monthly'];

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

const statusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'open': return 'success';
    case 'full': return 'warning';
    case 'in_progress': return 'warning';
    case 'completed': return 'error';
    default: return 'default';
  }
};

export function TournamentList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const dispatch = useDispatch();
  const { selectedGameType, selectedTournamentType } = useSelector(
    (state: RootState) => state.ui,
  );
  const authUser = useSelector((state: RootState) => state.auth.user);
  const selectedPlayerId = authUser?.id || '';

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, error } = useTournaments(
    selectedGameType || undefined,
    selectedTournamentType || undefined,
    page,
    rowsPerPage,
  );
  const joinMutation = useJoinTournament();
  const { data: myTournaments } = useMyTournaments(selectedPlayerId);
  const joinedIds = new Set(myTournaments?.map((t) => t.id) || []);

  const [confirmTournament, setConfirmTournament] = useState<Tournament | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false, message: '', severity: 'success',
  });

  // Create & Join dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createGameType, setCreateGameType] = useState('');
  const [createTournamentType, setCreateTournamentType] = useState('');
  const [createEntryFee, setCreateEntryFee] = useState('');

  const { data: tournamentDetails, isLoading: detailsLoading } = useTournamentDetails(detailsId);

  // Auto-close success animation
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleJoinClick = (t: Tournament, e: React.MouseEvent): void => {
    e.stopPropagation();
    setConfirmTournament(t);
  };

  const handleCreateJoin = async (): Promise<void> => {
    if (!createGameType || !createTournamentType || !createEntryFee) return;
    try {
      await joinMutation.mutateAsync({
        playerId: selectedPlayerId,
        gameType: createGameType,
        tournamentType: createTournamentType,
        entryFee: Number(createEntryFee),
      });
      setCreateOpen(false);
      setCreateGameType('');
      setCreateTournamentType('');
      setCreateEntryFee('');
      setShowSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to join';
      setCreateOpen(false);
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleConfirmJoin = async (): Promise<void> => {
    if (!confirmTournament) return;
    try {
      await joinMutation.mutateAsync({
        playerId: selectedPlayerId,
        gameType: confirmTournament.gameType,
        tournamentType: confirmTournament.tournamentType,
        entryFee: confirmTournament.entryFee,
      });
      setConfirmTournament(null);
      setShowSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to join';
      setConfirmTournament(null);
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3.5 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.85rem' } }}>
          Available Tournaments
        </Typography>
        <Typography variant="body2">
          Browse and join skill-based tournaments
        </Typography>
      </Box>

      {/* Filters Bar */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
            <InputLabel>Game Type</InputLabel>
            <Select value={selectedGameType} label="Game Type" onChange={(e) => { dispatch(setSelectedGameType(e.target.value)); setPage(1); }}>
              <MenuItem value="">All Games</MenuItem>
              {gameTypes.map((g) => <MenuItem key={g} value={g}>{capitalize(g)}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
            <InputLabel>Tournament Type</InputLabel>
            <Select value={selectedTournamentType} label="Tournament Type" onChange={(e) => { dispatch(setSelectedTournamentType(e.target.value)); setPage(1); }}>
              <MenuItem value="">All Types</MenuItem>
              {tournamentTypes.map((t) => <MenuItem key={t} value={t}>{capitalize(t)}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>
        <Box sx={{ ml: 'auto' }}>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Create & Join
          </Button>
        </Box>
      </Paper>

      {/* Loading / Error / Empty */}
      {isLoading && <TableSkeleton columns={6} rows={rowsPerPage} size={isMobile ? 'small' : 'medium'} />}
      {!!error && <Alert severity="error">Failed to load tournaments</Alert>}
      {!isLoading && !error && data?.data?.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SportsEsportsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">No tournaments found</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>Try adjusting your filters.</Typography>
        </Paper>
      )}

      {/* Table */}
      {data?.data && data.data.length > 0 && (
        <Paper>
          <TableContainer>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Game</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Entry Fee</TableCell>
                  <TableCell>Players</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell sx={{ width: 90 }} />
                  <TableCell sx={{ width: 40 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {data.data.map((t) => {
                  const alreadyJoined = joinedIds.has(t.id);
                  const isFull = t.status !== 'open' || t.playersCount >= t.maxPlayers;
                  const btnDisabled = alreadyJoined || isFull;
                  const btnTooltip = alreadyJoined
                    ? 'You have already joined this tournament'
                    : isFull
                      ? (t.status !== 'open' ? 'Tournament is not open' : 'Tournament is full')
                      : 'Join this tournament';
                  return (
                    <TableRow
                      key={t.id}
                      hover
                      sx={{ cursor: 'pointer', transition: 'background-color 0.15s' }}
                      onClick={() => setDetailsId(t.id)}
                    >
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
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {t.playersCount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            / {t.maxPlayers}
                          </Typography>
                        </Box>
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
                      <TableCell align="center">
                        <Tooltip title={btnTooltip}>
                          <span>
                            <Button
                              size="small"
                              variant={alreadyJoined ? 'outlined' : 'contained'}
                              color={alreadyJoined ? 'success' : 'primary'}
                              disabled={btnDisabled}
                              onClick={(e) => handleJoinClick(t, e)}
                              sx={{
                                minWidth: 'auto',
                                px: 2,
                                py: 0.5,
                                fontSize: '0.8rem',
                                borderRadius: 1.5,
                              }}
                            >
                              {alreadyJoined ? 'Joined' : 'Join'}
                            </Button>
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View details">
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); setDetailsId(t.id); }}
                            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                          >
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
          <TablePagination
            component="div"
            count={data.total || 0}
            page={page - 1}
            onPageChange={(_, newPage) => setPage(newPage + 1)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(1);
            }}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage={isMobile ? 'Rows:' : 'Rows per page:'}
          />
        </Paper>
      )}

      {/* Join Confirmation Dialog */}
      <Dialog
        open={!!confirmTournament}
        onClose={() => setConfirmTournament(null)}
        PaperProps={{ sx: { borderRadius: 2.5, overflow: 'hidden', width: 340, maxWidth: '92vw' } }}
      >
        {confirmTournament && (
          <>
            <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Join Tournament
              </Typography>
              <IconButton size="small" onClick={() => setConfirmTournament(null)} sx={{ color: 'text.disabled', p: 0.5 }}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
            <DialogContent sx={{ px: 2.5, py: 2 }}>
              {/* Tournament card */}
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                <Box sx={{ px: 2, py: 1.2, background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsEsportsIcon sx={{ color: '#fff', fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}>
                      {capitalize(confirmTournament.gameType)}
                    </Typography>
                  </Box>
                  <Chip label={capitalize(confirmTournament.tournamentType)} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600 }} />
                </Box>
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Entry Fee</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '0.95rem', lineHeight: 1.2 }}>${confirmTournament.entryFee}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Players</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2 }}>{confirmTournament.playersCount}<Typography component="span" variant="caption" color="text.secondary"> / {confirmTournament.maxPlayers}</Typography></Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(confirmTournament.playersCount / confirmTournament.maxPlayers) * 100}
                    sx={{ height: 4, borderRadius: 2, bgcolor: '#eef2f7', '& .MuiLinearProgress-bar': { borderRadius: 2 } }}
                  />
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block', fontSize: '0.65rem' }}>
                    {confirmTournament.maxPlayers - confirmTournament.playersCount} spot{confirmTournament.maxPlayers - confirmTournament.playersCount !== 1 ? 's' : ''} remaining
                  </Typography>
                </Box>
              </Box>
              {/* Player info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                <PersonOutlineIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">Joining as</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, ml: 'auto' }}>{authUser?.name || selectedPlayerId}</Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 2.5, pb: 2, pt: 0, gap: 1 }}>
              <Button onClick={() => setConfirmTournament(null)} size="small" sx={{ flex: 1, color: 'text.secondary', fontSize: '0.78rem' }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleConfirmJoin}
                disabled={joinMutation.isLoading}
                sx={{ flex: 1.4, fontSize: '0.78rem', py: 0.7 }}
              >
                {joinMutation.isLoading ? 'Joining...' : 'Confirm & Join'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create & Join Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        PaperProps={{ sx: { borderRadius: 2.5, overflow: 'hidden', width: 380, maxWidth: '92vw' } }}
      >
        <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Create & Join Tournament
          </Typography>
          <IconButton size="small" onClick={() => setCreateOpen(false)} sx={{ color: 'text.disabled', p: 0.5 }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
        <DialogContent sx={{ px: 2.5, py: 2.5 }}>
          <Stack spacing={2}>
            {/* Player (read-only) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
              <PersonOutlineIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">Player</Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, ml: 'auto' }}>{authUser?.name || selectedPlayerId}</Typography>
            </Box>
            <FormControl fullWidth size="small" required>
              <InputLabel>Game Type</InputLabel>
              <Select value={createGameType} label="Game Type" onChange={(e) => setCreateGameType(e.target.value)}>
                {gameTypes.map((g) => <MenuItem key={g} value={g}>{capitalize(g)}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" required>
              <InputLabel>Tournament Type</InputLabel>
              <Select value={createTournamentType} label="Tournament Type" onChange={(e) => setCreateTournamentType(e.target.value)}>
                {tournamentTypes.map((t) => <MenuItem key={t} value={t}>{capitalize(t)}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Entry Fee"
              type="number"
              size="small"
              value={createEntryFee}
              onChange={(e) => setCreateEntryFee(e.target.value)}
              required
              fullWidth
              inputProps={{ min: 0, step: 1 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2, pt: 0, gap: 1 }}>
          <Button onClick={() => setCreateOpen(false)} size="small" sx={{ flex: 1, color: 'text.secondary', fontSize: '0.78rem' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleCreateJoin}
            disabled={!createGameType || !createTournamentType || !createEntryFee || joinMutation.isLoading}
            sx={{ flex: 1.4, fontSize: '0.78rem', py: 0.7 }}
          >
            {joinMutation.isLoading ? 'Joining...' : 'Create & Join'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={showSuccess}
        PaperProps={{ sx: { borderRadius: 2.5, overflow: 'hidden', width: 300, maxWidth: '90vw' } }}
        slotProps={{ backdrop: { sx: { bgcolor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)' } } }}
      >
        <Zoom in={showSuccess} timeout={350}>
          <Box sx={{ textAlign: 'center', px: 3, pt: 3, pb: 2.5 }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: '50%', bgcolor: '#e8f5e9', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', mb: 1.5,
            }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 26, color: 'success.main' }} />
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.25, fontSize: '0.95rem' }}>
              You&apos;re In!
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.4 }}>
              Successfully joined the tournament.
              <br />Good luck!
            </Typography>
            <Box sx={{ height: 3, borderRadius: 2, bgcolor: '#e8f5e9', overflow: 'hidden' }}>
              <Box sx={{
                height: '100%', bgcolor: 'success.main', borderRadius: 2,
                animation: 'shrink 2s linear forwards',
                '@keyframes shrink': { from: { width: '100%' }, to: { width: '0%' } },
              }} />
            </Box>
          </Box>
        </Zoom>
      </Dialog>

      {/* Tournament Details Drawer */}
      <Drawer anchor="right" open={!!detailsId} onClose={() => setDetailsId(null)}>
        <Box sx={{ width: { xs: '100vw', sm: 420 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6">Tournament Details</Typography>
            <IconButton onClick={() => setDetailsId(null)} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ p: 2.5, flex: 1, overflow: 'auto' }}>
            {detailsLoading && <DetailsSkeleton />}
            {!detailsLoading && tournamentDetails && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                  <Chip
                    label={capitalize(tournamentDetails.status)}
                    color={statusColor(tournamentDetails.status)}
                    sx={{ fontWeight: 600, px: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {tournamentDetails.id.slice(0, 8)}...
                  </Typography>
                </Box>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <SportsEsportsIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Game</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{capitalize(tournamentDetails.gameType)}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <CalendarTodayIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Type</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{capitalize(tournamentDetails.tournamentType)}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <PaidOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Entry Fee</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>${tournamentDetails.entryFee}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <GroupsOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Capacity</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {tournamentDetails.players?.length || 0} / {tournamentDetails.maxPlayers} players
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1.5, color: 'text.primary', fontWeight: 600 }}>
                    Players ({tournamentDetails.players?.length || 0})
                  </Typography>
                  <List dense disablePadding>
                    {tournamentDetails.players?.map((p) => (
                      <ListItem key={p.id} sx={{ px: 0, py: 0.75 }}>
                        <ListItemAvatar sx={{ minWidth: 40 }}>
                          <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.light', fontSize: '0.75rem' }}>
                            <PersonOutlineIcon sx={{ fontSize: 18 }} />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={p.playerId}
                          secondary={new Date(p.joinedAt).toLocaleDateString()}
                          primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                      </ListItem>
                    ))}
                    {(!tournamentDetails.players || tournamentDetails.players.length === 0) && (
                      <Box sx={{ textAlign: 'center', py: 3 }}>
                        <PersonOutlineIcon sx={{ fontSize: 36, color: 'text.secondary', mb: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">No players yet</Typography>
                      </Box>
                    )}
                  </List>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
                  Created {new Date(tournamentDetails.createdAt).toLocaleDateString()}
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
          elevation={6}
          sx={{ borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
