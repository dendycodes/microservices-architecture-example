import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a5f',
      light: '#2d5a8e',
      dark: '#0f1f33',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4a90d9',
      light: '#6ba8e8',
      dark: '#2d6cb5',
    },
    success: {
      main: '#2e7d32',
      light: '#e8f5e9',
    },
    warning: {
      main: '#ed6c02',
      light: '#fff3e0',
    },
    error: {
      main: '#d32f2f',
      light: '#ffebee',
    },
    background: {
      default: '#f4f6f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a2027',
      secondary: '#5f6b7a',
    },
    divider: '#e8ecf1',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500, color: '#5f6b7a' },
    body2: { color: '#5f6b7a' },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
    '0 2px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.06)',
    '0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
    '0 6px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
    '0 8px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)',
    '0 12px 32px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06)',
    '0 16px 40px rgba(0,0,0,0.1), 0 6px 16px rgba(0,0,0,0.06)',
    '0 20px 48px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06)',
    ...Array(16).fill('0 20px 48px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06)'),
  ] as unknown as typeof createTheme extends (o: infer T) => unknown ? T extends { shadows?: infer S } ? S : never : never,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#f4f6f9' },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid #e8ecf1',
          backgroundImage: 'none',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#f8fafc',
            color: '#3d4f66',
            fontWeight: 600,
            fontSize: '0.8125rem',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            borderBottom: '2px solid #e8ecf1',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': { borderBottom: 0 },
          '&.MuiTableRow-hover:hover': {
            backgroundColor: '#f0f5ff',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#f0f2f5',
          padding: '14px 16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
        outlined: { borderWidth: '1.5px' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 600,
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 2px 6px rgba(30,58,95,0.2)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(30,58,95,0.3)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          border: 'none',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          boxShadow: '-8px 0 30px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4a90d9',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8 },
        standardInfo: {
          backgroundColor: '#eef4fc',
          color: '#1e3a5f',
        },
      },
    },
  },
});
