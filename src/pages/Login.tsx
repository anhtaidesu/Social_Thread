import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Link, 
  Paper, 
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
  useTheme,
  styled,
  Fade
} from '@mui/material';
import { 
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { login } from '../features/auth/authSlice';
import type { AppDispatch, RootState } from '../app/store';
import { AuthState } from '../types';

// Styled Google sign-in button
const GoogleButton = styled(Button)(({ theme }) => ({
  padding: '12px 0',
  backgroundColor: '#ffffff',
  color: '#757575',
  fontWeight: 600,
  fontSize: '16px',
  border: '1px solid #dadce0',
  '&:hover': {
    backgroundColor: '#f6f6f6',
    border: '1px solid #dadce0',
  },
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  borderRadius: '8px',
}));

const Login: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth as AuthState);
  const { isLoading, error, isAuthenticated, token } = auth;
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  useEffect(() => {
    console.log('Auth state:', auth);
    
    if (isAuthenticated && token) {
      console.log('Người dùng đã xác thực. Chuyển hướng đến trang chủ...');
      navigate('/');
    }
  }, [isAuthenticated, navigate, token, auth]);
  
  const validateForm = () => {
    let valid = true;
    const errors = {
      email: '',
      password: ''
    };
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email là bắt buộc';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
      valid = false;
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Mật khẩu là bắt buộc';
      valid = false;
    } else if (formData.password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
      valid = false;
    }
    
    setFormErrors(errors);
    return valid;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    // Clear error for this field when user types
    if (formErrors[e.target.name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    console.log('Bắt đầu đăng nhập với:', formData);
    
    try {
      const resultAction = await dispatch(login({
        email: formData.email,
        password: formData.password
      }));
      
      console.log('Kết quả đăng nhập:', resultAction);
      
      if (login.fulfilled.match(resultAction)) {
        setSnackbarMessage('Đăng nhập thành công!');
        setSnackbarOpen(true);
        setDebugInfo(resultAction.payload);
        // Không cần navigate vì useEffect sẽ xử lý
      } else if (login.rejected.match(resultAction)) {
        console.error('Đăng nhập thất bại:', resultAction.payload);
        setDebugInfo(resultAction.payload || resultAction.error);
      }
    } catch (error) {
      console.error('Lỗi khi xử lý đăng nhập:', error);
      setDebugInfo(error);
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    
    try {
      // Open the Google auth window
      window.open(`${process.env.REACT_APP_AUTH_API_URL}/api/auth/google`, '_self');
      
      // Set up message listener for OAuth callback
      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'google-auth-success') {
          console.log('Google authentication successful', event.data);
          setSnackbarMessage('Đăng nhập Google thành công!');
          setSnackbarOpen(true);
          // Redux will handle the authentication state
        } else if (event.data.type === 'google-auth-error') {
          console.error('Google authentication failed', event.data);
          setSnackbarMessage('Đăng nhập Google thất bại: ' + event.data.error);
          setSnackbarOpen(true);
          setGoogleLoading(false);
        }
      });
    } catch (error) {
      console.error('Error during Google login:', error);
      setSnackbarMessage('Lỗi kết nối với Google');
      setSnackbarOpen(true);
      setGoogleLoading(false);
    }
  };
  
  const handleFacebookLogin = () => {
    window.open(`${process.env.REACT_APP_AUTH_API_URL}/api/auth/facebook`, '_self');
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={theme.palette.mode === 'dark' ? 3 : 1} 
        sx={{ 
          mt: 8, 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2,
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.threadsDark.cardBackground : theme.palette.threadsLight.cardBackground,
          border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.threadsDark.border : theme.palette.threadsLight.border}`
        }}
      >
        <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mb: 5 }}>
          Đăng nhập
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Prominent Google Sign-In Button */}
        <GoogleButton
          fullWidth
          variant="outlined"
          startIcon={
            googleLoading ? null : <GoogleIcon sx={{ color: '#4285F4' }} />
          }
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          sx={{ mb: 4, position: 'relative', height: '50px' }}
        >
          {googleLoading ? (
            <CircularProgress size={24} sx={{ position: 'absolute', color: '#4285F4' }} />
          ) : (
            'Đăng nhập với Google'
          )}
        </GoogleButton>
        
        <Divider sx={{ width: '100%', mb: 4 }}>HOẶC</Divider>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Địa chỉ Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
            error={!!formErrors.email}
            helperText={formErrors.email}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            variant="outlined"
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Link 
              component={RouterLink} 
              to="/reset-password" 
              variant="body2"
              sx={{ color: theme.palette.primary.main }}
            >
              Forgot password?
            </Link>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Đăng nhập'}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/register" 
                variant="body2"
                sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>
        
        {debugInfo && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1, width: '100%', overflow: 'auto' }}>
            <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(debugInfo, null, 2)}
            </Typography>
          </Box>
        )}
      </Paper>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={error ? "error" : "success"}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login; 