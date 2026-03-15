import { Component, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
            <Typography variant="h5" gutterBottom>Something went wrong</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              An unexpected error occurred. Please try refreshing the page.
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}
