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
  Stepper,
  Step,
  StepLabel,
  useTheme
} from '@mui/material';
import { 
  Google as GoogleIcon,
  Facebook as FacebookIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { register, requestOtp, clearOtpState } from '../features/auth/authSlice';
import type { AppDispatch, RootState } from '../app/store';
import { AuthState } from '../types';

const Register: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth as AuthState);
  const { isLoading, error, isAuthenticated, otpSent } = auth;
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // If already authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Reset OTP state when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearOtpState());
    };
  }, [dispatch]);
  
  // Move to step 2 when OTP is sent
  useEffect(() => {
    if (otpSent && activeStep === 0) {
      setActiveStep(1);
      setSnackbarMessage('OTP sent to your email!');
      setSnackbarOpen(true);
    }
  }, [otpSent, activeStep]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateEmail = () => {
    let valid = true;
    const errors = { ...formErrors };
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      valid = false;
    } else {
      errors.email = '';
    }
    
    setFormErrors({...formErrors, ...errors});
    return valid;
  };
  
  const validatePassword = () => {
    let valid = true;
    const errors = { ...formErrors };
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
      valid = false;
    } else {
      errors.password = '';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      valid = false;
    } else {
      errors.confirmPassword = '';
    }
    
    setFormErrors({...formErrors, ...errors});
    return valid;
  };
  
  const validateOtp = () => {
    let valid = true;
    const errors = { ...formErrors };
    
    if (!formData.otp) {
      errors.otp = 'OTP is required';
      valid = false;
    } else if (!/^\d{6}$/.test(formData.otp)) {
      errors.otp = 'OTP must be 6 digits';
      valid = false;
    } else {
      errors.otp = '';
    }
    
    setFormErrors({...formErrors, ...errors});
    return valid;
  };
  
  const validateUsername = () => {
    let valid = true;
    const errors = { ...formErrors };
    
    if (!formData.username) {
      errors.username = 'Username is required';
      valid = false;
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
      valid = false;
    } else {
      errors.username = '';
    }
    
    setFormErrors({...formErrors, ...errors});
    return valid;
  };
  
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }
    
    await dispatch(requestOtp({ email: formData.email }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For step 1 (Request OTP)
    if (activeStep === 0) {
      handleRequestOtp(e);
      return;
    }
    
    // For step 2 (Register with OTP)
    if (!validateEmail() || !validatePassword() || !validateOtp() || !validateUsername()) {
      return;
    }
    
    const { email, password, otp } = formData;
    const resultAction = await dispatch(register({ email, password, otp }));
    
    if (register.fulfilled.match(resultAction)) {
      setSnackbarMessage('Registration successful!');
      setSnackbarOpen(true);
      // Navigation will happen automatically due to useEffect
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const handleGoogleRegister = () => {
    // This would be implemented with OAuth
    window.open(`${process.env.REACT_APP_AUTH_API_URL}/api/auth/google`, '_self');
  };
  
  const handleFacebookRegister = () => {
    // This would be implemented with OAuth
    window.open(`${process.env.REACT_APP_AUTH_API_URL}/api/auth/facebook`, '_self');
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  const steps = ['Request Verification', 'Create Account'];
  
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
        <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          Sign up for Threads
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
            error={!!formErrors.email}
            helperText={formErrors.email}
            disabled={activeStep > 0}
            sx={{ mb: 2 }}
          />
          
          {activeStep === 1 && (
            <>
              <TextField
                margin="normal"
                required
                fullWidth
                id="otp"
                label="OTP Code"
                name="otp"
                autoComplete="off"
                value={formData.otp}
                onChange={handleChange}
                variant="outlined"
                error={!!formErrors.otp}
                helperText={formErrors.otp || "Enter the 6-digit code sent to your email"}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                variant="outlined"
                error={!!formErrors.username}
                helperText={formErrors.username}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleChange}
                variant="outlined"
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
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                variant="outlined"
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleToggleConfirmPasswordVisibility}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
            </>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ 
              py: 1.5,
              position: 'relative'
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ position: 'absolute' }} />
            ) : (
              activeStep === 0 ? 'Request Verification Code' : 'Sign Up'
            )}
          </Button>
          
          {activeStep === 0 && (
            <>
              <Divider sx={{ my: 3 }}>OR</Divider>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleRegister}
                sx={{ mb: 2, py: 1.2 }}
              >
                Continue with Google
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FacebookIcon />}
                onClick={handleFacebookRegister}
                sx={{ py: 1.2 }}
              >
                Continue with Facebook
              </Button>
            </>
          )}
        </Box>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" fontWeight="bold">
              Log In
            </Link>
          </Typography>
        </Box>
      </Paper>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default Register; 