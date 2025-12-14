import { Box, Container } from '@mui/material';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main layout wrapper with content container
 * Provides consistent spacing and responsive behavior
 * Note: Header is now replaced by DynamicIslandNavbar in App.tsx
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        pt: 14, // Add top padding to account for fixed navbar
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
