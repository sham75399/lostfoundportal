import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  InputAdornment
} from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import api from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSuccess(true);
      setMessage(response.data.message || 'Password reset email sent!');
      setError('');
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.response?.data?.message || 'Failed to send reset email');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" className="py-16">
      <Paper elevation={3} className="p-8">
        <Typography variant="h4" className="text-center font-bold mb-2">
          Forgot Password
        </Typography>
        <Typography className="text-center text-gray-600 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </Typography>

        {success && (
          <Alert severity="success" className="mb-4">
            {message}
          </Alert>
        )}

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              )
            }}
            disabled={success}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading || success}
            className="mb-4"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <Box className="text-center">
            <Button
              component={Link}
              to="/login"
              startIcon={<ArrowBack />}
              className="text-primary"
            >
              Back to Login
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;