import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Skeleton,
} from '@mui/material';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  size?: 'small' | 'medium';
}

export function TableSkeleton({ columns, rows = 5, size = 'medium' }: TableSkeletonProps) {
  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table size={size}>
        <TableHead>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableCell key={i}>
                <Skeleton variant="text" width="60%" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton variant="text" width={`${55 + ((rowIndex * 7 + colIndex * 13) % 35)}%`} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
