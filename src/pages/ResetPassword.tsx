import React, { useState } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  useTheme
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  LockReset as LockResetIcon
} from '@mui/icons-material';
import { requestOtp, resetPassword } from '../features/auth/authSlice';
import type { AppDispatch, RootState } from '../app/store';
import { AuthState } from '../types';

// Step labels
const steps = ['Email Verification', 'OTP Verification', 'New Password'];

const ResetPassword: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth as AuthState);
  const { isLoading, error, otpSent, otpEmail } = auth;
  
  // Active step in the password reset flow
  const [activeStep, setActiveStep] = useState(0);
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: ''
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: ''
  });
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Success message
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // Validate each step
  const validateStep = (step: number) => {
    let valid = true;
    const errors = { ...formErrors };
    
    if (step === 0) {
      // Email validation
      if (!formData.email) {
        errors.email = 'Email is required';
        valid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Invalid email format';
        valid = false;
      }
    } else if (step === 1) {
      // OTP validation
      if (!formData.otp) {
        errors.otp = 'OTP is required';
        valid = false;
      } else if (!/^\d{6}$/.test(formData.otp)) {
        errors.otp = 'OTP must be 6 digits';
        valid = false;
      }
    } else if (step === 2) {
      // Password validation
      if (!formData.password) {
        errors.password = 'Password is required';
        valid = false;
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
        valid = false;
      }
      
      // Confirm password validation
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
        valid = false;
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
        valid = false;
      }
    }
    
    setFormErrors(errors);
    return valid;
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Handle visibility toggle for passwords
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Request OTP
  const handleRequestOtp = async () => {
    if (!validateStep(0)) return;
    
    try {
      const resultAction = await dispatch(requestOtp({ email: formData.email }));
      
      if (requestOtp.fulfilled.match(resultAction)) {
        console.log('OTP sent successfully');
        setActiveStep(1);
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
    }
  };
  
  // Reset password
  const handleResetPassword = async () => {
    if (!validateStep(2)) return;
    
    try {
      const resultAction = await dispatch(resetPassword({
        email: formData.email,
        otp: formData.otp,
        password: formData.password
      }));
      
      if (resetPassword.fulfilled.match(resultAction)) {
        console.log('Password reset successful');
        setResetSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };
  
  // Handle next step
  const handleNext = () => {
    if (activeStep === 0) {
      handleRequestOtp();
    } else if (activeStep === 1) {
      if (validateStep(1)) {
        setActiveStep(2);
      }
    } else if (activeStep === 2) {
      handleResetPassword();
    }
  };
  
  // Handle back
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Render step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Enter your email address and we'll send you a one-time password to reset your password.
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              We've sent a 6-digit code to <b>{formData.email}</b>. Enter the code below to continue.
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="One-Time Password"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              error={!!formErrors.otp}
              helperText={formErrors.otp}
              placeholder="Enter 6-digit code"
              inputProps={{ maxLength: 6 }}
            />
            <Button
              variant="text"
              onClick={handleRequestOtp}
              disabled={isLoading}
              sx={{ mt: 1 }}
            >
              Resend Code
            </Button>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Create a new password for your account.
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
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
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={theme.palette.mode === 'dark' ? 3 : 1} 
        sx={{ 
          mt: 8, 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2,
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.threadsDark?.cardBackground : theme.palette.threadsLight?.cardBackground,
          border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.threadsDark?.border : theme.palette.threadsLight?.border}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <LockResetIcon sx={{ fontSize: 40, mr: 2, color: theme.palette.primary.main }} />
          <Typography component="h1" variant="h4" fontWeight="bold">
            Reset Password
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {resetSuccess && (
          <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
            Password reset successful! Redirecting to login...
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
          {steps.map((label) => {
            return (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
        
        <Box sx={{ width: '100%', mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? () => navigate('/login') : handleBack}
            sx={{ mr: 1 }}
          >
            {activeStep === 0 ? 'Back to Login' : 'Back'}
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={isLoading}
            sx={{ position: 'relative' }}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ position: 'absolute' }} />
            ) : activeStep === steps.length - 1 ? (
              'Reset Password'
            ) : (
              'Next'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword; 