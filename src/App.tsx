import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, CircularProgress, Container, ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { darkTheme, lightTheme } from './utils/theme';
import MainLayout from './layouts/MainLayout';
import { RootState } from './app/store';
import { AuthState } from './types';

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Search = React.lazy(() => import('./pages/Search'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const CreatePost = React.lazy(() => import('./pages/CreatePost'));
const PostDetail = React.lazy(() => import('./pages/PostDetail'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const ProfileDebug = React.lazy(() => import('./pages/ProfileDebug'));

// Add a loading component
const LoadingComponent = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
    <CircularProgress />
  </Box>
);

// Auth guard component
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useSelector<RootState, AuthState>(state => state.auth);
  const location = useLocation();

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (!isAuthenticated) {
    // Redirect to login
    window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`;
    return null;
  }

  return <>{children}</>;
};

// Public route component (redirects to home if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector<RootState, AuthState>(state => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector<RootState, AuthState>(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('theme');
    return savedMode ? savedMode === 'dark' : true; // Default to dark mode like Threads
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <React.Suspense fallback={<LoadingComponent />}>
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              } 
            />
            
            {/* Protected routes within MainLayout */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MainLayout toggleTheme={toggleTheme} />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="search" element={<Search />} />
              <Route path="create" element={<CreatePost />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile/:userId" element={<Profile />} />
              <Route path="@:username" element={<Profile />} />
              <Route path="post/:postId" element={<PostDetail />} />
              {/* Debug routes - use for troubleshooting */}
              <Route path="debug/profile" element={<ProfileDebug />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            
            {/* Redirect from /profile to /profile/:userId if logged in */}
            <Route
              path="/profile"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </React.Suspense>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
