import { useState } from 'react';
import {
  Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem,
  Button, Alert, CircularProgress,
} from '@mui/material';
import { useLogin } from '../hooks/useLogin';
import { PlayerOption } from '../types';

const players: PlayerOption[] = [
  { id: 'player-1', name: 'Alice Johnson' },
  { id: 'player-2', name: 'Bob Smith' },
  { id: 'player-3', name: 'Charlie Brown' },
  { id: 'player-4', name: 'Diana Prince' },
  { id: 'player-5', name: 'Eve Wilson' },
];

export function LoginPage() {
  const [selectedPlayer, setSelectedPlayer] = useState('player-1');
  const loginMutation = useLogin();

  const handleLogin = (): void => {
    loginMutation.mutate(selectedPlayer);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        px: { xs: 2, sm: 0 },
        background: 'linear-gradient(145deg, #0f1f33 0%, #1e3a5f 40%, #2d5a8e 100%)',
      }}
    >
      <Paper
        sx={{
          p: { xs: 3.5, sm: 5 },
          maxWidth: 440,
          width: '100%',
          borderRadius: 3,
          border: 'none',
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
          <img src="/logo.png" alt="Atom Solutions" style={{ height: 52, marginBottom: 16 }} />
          <Typography variant="h4" sx={{ color: 'text.primary' }}>
            Skill Tournaments
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
            Select a player to get started
          </Typography>
        </Box>

        {loginMutation.isError && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {loginMutation.error instanceof Error ? loginMutation.error.message : 'Login failed'}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Player</InputLabel>
          <Select value={selectedPlayer} label="Player" onChange={(e) => setSelectedPlayer(e.target.value)}>
            {players.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleLogin}
          disabled={loginMutation.isLoading}
          sx={{ py: 1.5, fontSize: '0.95rem' }}
        >
          {loginMutation.isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
        </Button>
      </Paper>
    </Box>
  );
}
