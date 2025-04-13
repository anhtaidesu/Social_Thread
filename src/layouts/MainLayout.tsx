import React, { useState, useEffect } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Drawer, 
  List, 
  ListItem,
  ListItemButton,
  ListItemIcon, 
  ListItemText,
  Badge,
  Container,
  useMediaQuery,
  Divider,
  Avatar,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Home as HomeIcon, 
  Search as SearchIcon, 
  Add as AddIcon, 
  Favorite as FavoriteIcon, 
  Person as PersonIcon,
  Menu as MenuIcon, 
  Close as CloseIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import { AuthState } from '../types';
import { logout } from '../features/auth/authSlice';

const drawerWidth = 240;

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF',
  color: theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000',
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#333333' : '#DBDBDB'}`,
}));

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF',
  minHeight: '100vh',
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

interface MainLayoutProps {
  toggleTheme: () => void;
}

// Define the interface for notifications state
interface NotificationsState {
  unreadCount: number;
}

const MainLayout: React.FC<MainLayoutProps> = ({ toggleTheme }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const notificationsState = useSelector((state: RootState) => state.notifications) as NotificationsState;
  const authState = useSelector((state: RootState) => state.auth) as AuthState;
  
  const unreadCount = notificationsState.unreadCount;
  const user = authState.user;
  const isAuthenticated = authState.isAuthenticated;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !location.pathname.includes('/login') && !location.pathname.includes('/register')) {
      navigate('/login');
    } else if (isAuthenticated && (location.pathname.includes('/login') || location.pathname.includes('/register'))) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF', 
    }}>
      <DrawerHeader sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Threads
        </Typography>
        {isMobile && (
          <IconButton 
            onClick={handleDrawerToggle}
            sx={{ position: 'absolute', right: 8 }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DrawerHeader>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        <ListItemButton 
          selected={location.pathname === '/'}
          onClick={() => {
            navigate('/');
            if (isMobile) setMobileOpen(false);
          }}
        >
          <ListItemIcon>
            <HomeIcon color={location.pathname === '/' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton 
          selected={location.pathname === '/search'}
          onClick={() => {
            navigate('/search');
            if (isMobile) setMobileOpen(false);
          }}
        >
          <ListItemIcon>
            <SearchIcon color={location.pathname === '/search' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Search" />
        </ListItemButton>
        <ListItemButton 
          selected={location.pathname === '/create'}
          onClick={() => {
            navigate('/create');
            if (isMobile) setMobileOpen(false);
          }}
        >
          <ListItemIcon>
            <AddIcon color={location.pathname === '/create' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Create" />
        </ListItemButton>
        <ListItemButton 
          selected={location.pathname === '/notifications'}
          onClick={() => {
            navigate('/notifications');
            if (isMobile) setMobileOpen(false);
          }}
        >
          <ListItemIcon>
            <Badge badgeContent={unreadCount} color="error">
              <FavoriteIcon color={location.pathname === '/notifications' ? 'primary' : 'inherit'} />
            </Badge>
          </ListItemIcon>
          <ListItemText primary="Notifications" />
        </ListItemButton>
        <ListItemButton 
          selected={location.pathname === '/profile'}
          onClick={() => {
            navigate(user ? `/profile/${user.id}` : '/login');
            if (isMobile) setMobileOpen(false);
          }}
        >
          <ListItemIcon>
            {user?.profilePicture ? (
              <Avatar 
                src={user.profilePicture} 
                sx={{ width: 24, height: 24 }}
              />
            ) : (
              <PersonIcon color={location.pathname.includes('/profile') ? 'primary' : 'inherit'} />
            )}
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItemButton>
      </List>
      <Divider />
      <List>
        <ListItemButton onClick={toggleTheme}>
          <ListItemIcon>
            {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText primary={theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
        </ListItemButton>
        {isAuthenticated && (
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <StyledAppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            {isMobile ? 'Threads' : ''}
          </Typography>
        </Toolbar>
      </StyledAppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF', 
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                backgroundColor: theme.palette.mode === 'dark' ? '#000000' : '#FFFFFF',
                borderRight: `1px solid ${theme.palette.mode === 'dark' ? '#333333' : '#DBDBDB'}`,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      <Main>
        <DrawerHeader />
        <Container maxWidth="md" sx={{ py: 2 }}>
          <Outlet />
        </Container>
      </Main>
    </Box>
  );
};

export default MainLayout; 