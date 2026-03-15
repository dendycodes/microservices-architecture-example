import { AppBar, Toolbar, Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

export function PlayerSelector() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: { xs: 56, sm: 64 } }}>
        <Box sx={{ flexGrow: 1 }} />
        {user && (
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                bgcolor: 'success.light',
                color: 'success.main',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 18 }} />
              ${user.balance}
            </Box>
            {!isMobile && (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                Welcome, <strong style={{ color: '#1a2027' }}>{user.name}</strong>
              </Typography>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
