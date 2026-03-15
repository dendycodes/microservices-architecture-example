import { Box, Skeleton, Divider } from '@mui/material';

export function DetailsSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
      <Divider sx={{ mb: 2 }} />
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} variant="text" width={`${55 + ((i * 13) % 35)}%`} height={28} sx={{ mb: 0.5 }} />
      ))}
      <Skeleton variant="text" width="40%" height={36} sx={{ mt: 2, mb: 1 }} />
      {Array.from({ length: 3 }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="text" width="35%" height={16} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
