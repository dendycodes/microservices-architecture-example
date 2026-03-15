import { Refine } from '@refinedev/core';
import { ThemedLayoutV2 } from '@refinedev/mui';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import routerProvider from '@refinedev/react-router-v6';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import { RootState } from './store';
import { dataProvider } from './providers/dataProvider';
import { TournamentList } from './pages/tournaments/TournamentList';
import { MyTournaments } from './pages/tournaments/MyTournaments';
import { LoginPage } from './pages/LoginPage';
import { PlayerSelector } from './components/PlayerSelector';
import { CustomSider } from './components/CustomSider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { theme } from './theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthenticatedApp() {
  const token = useSelector((state: RootState) => state.auth.token);

  if (!token) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <Refine
        routerProvider={routerProvider}
        dataProvider={dataProvider}
        resources={[
          {
            name: 'tournaments',
            list: '/tournaments',
            meta: { icon: <EmojiEventsIcon /> },
          },
          {
            name: 'my-tournaments',
            list: '/my-tournaments',
            meta: { label: 'My Tournaments', icon: <PersonIcon /> },
          },
        ]}
      >
        <Routes>
          <Route
            element={
              <ThemedLayoutV2
                Sider={() => <CustomSider />}
                Header={() => <PlayerSelector />}
              >
                <Outlet />
              </ThemedLayoutV2>
            }
          >
            <Route index element={<TournamentList />} />
            <Route path="/tournaments" element={<TournamentList />} />
            <Route path="/my-tournaments" element={<MyTournaments />} />
          </Route>
        </Routes>
      </Refine>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthenticatedApp />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
