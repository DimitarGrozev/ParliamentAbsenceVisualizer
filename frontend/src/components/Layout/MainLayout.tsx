import { Box, Container } from '@mui/material';
import { Header } from './Header';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main layout wrapper with header and content container
 * Provides consistent spacing and responsive behavior
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <Header />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
