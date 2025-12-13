import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

/**
 * App header with title and branding
 */
export function Header() {
  return (
    <AppBar position="static" elevation={2}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AccountBalanceIcon sx={{ mr: 2, fontSize: 32 }} />
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 600,
              flexGrow: 1,
            }}
          >
            Bulgarian Parliament Absence Tracker
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
