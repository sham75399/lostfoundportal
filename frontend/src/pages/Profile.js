import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Grid,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Divider,
  IconButton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Delete,
  Verified
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, setUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });
  const [stats, setStats] = useState({
    itemsLost: 0,
    itemsFound: 0,
    claimsMade: 0
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
      setStats({
        itemsLost: user.itemsLost || 0,
        itemsFound: user.itemsFound || 0,
        claimsMade: user.claimsMade || 0
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const response = await api.put('/auth/profile', formData);
      setUser(response.data.user);
      setSuccessMessage('Profile updated successfully!');
      setEditing(false);
      if (refreshUser) await refreshUser();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccessMessage('Password updated successfully!');
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(true);
    try {
      const response = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(response.data.user);
      setFormData({
        ...formData,
        avatar: response.data.user.avatar
      });
      setSuccessMessage('Avatar updated successfully!');
      if (refreshUser) await refreshUser();
    } catch (error) {
      setError('Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setLoading(true);
      try {
        await api.delete('/auth/account');
        localStorage.removeItem('token');
        window.location.href = '/';
      } catch (error) {
        setError('Failed to delete account');
        setLoading(false);
      }
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="md" className="py-8">
      <Paper className="p-6">
        <Grid container spacing={4}>
          {/* Avatar Section */}
          <Grid item xs={12} md={4} className="text-center">
            <Box className="relative inline-block">
              <Avatar
                src={formData.avatar || user.avatar}
                sx={{ width: 150, height: 150 }}
                className="mx-auto"
              >
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
              {editing && (
                <IconButton
                  component="label"
                  className="absolute bottom-0 right-0 bg-white shadow-lg"
                  size="small"
                >
                  <PhotoCamera />
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleAvatarUpload}
                  />
                </IconButton>
              )}
            </Box>
            <Typography variant="h6" className="mt-4 font-bold">
              {user.name}
            </Typography>
            <div className="flex items-center justify-center gap-1">
              <Typography variant="body2" color="textSecondary">
                {user.role === 'admin' ? 'Administrator' : 'Member'}
              </Typography>
              {user.isVerified && (
                <Verified className="text-primary" fontSize="small" />
              )}
            </div>
            <Typography variant="body2" color="textSecondary">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </Typography>

            <Divider className="my-4" />

            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleDeleteAccount}
              className="mt-2"
            >
              Delete Account
            </Button>
          </Grid>

          {/* Profile Info Section */}
          <Grid item xs={12} md={8}>
            <Box className="flex justify-between items-center mb-4">
              <Typography variant="h5" className="font-bold">
                Profile Information
              </Typography>
              {!editing ? (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        avatar: user.avatar
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleUpdateProfile}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </Box>

            <Divider className="mb-4" />

            <div className="space-y-4">
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!editing}
              />

              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!editing}
              />

              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter your phone number"
              />

              <div className="flex justify-end">
                <Button
                  variant="outlined"
                  onClick={() => setShowPasswordDialog(true)}
                >
                  Change Password
                </Button>
              </div>
            </div>

            {/* Stats Section */}
            <Divider className="my-4" />

            <Typography variant="h6" className="font-bold mb-4">
              Your Activity
            </Typography>
            
            <Grid container spacing={3}>
              {/* Lost Items Count */}
              <Grid item xs={12} sm={4}>
                <Box className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <Typography variant="h2" className="font-bold text-red-600">
                    {stats.itemsLost}
                  </Typography>
                  <Typography variant="body2" className="text-red-700 font-medium">
                    Items Lost
                  </Typography>
                </Box>
              </Grid>

              {/* Found Items Count */}
              <Grid item xs={12} sm={4}>
                <Box className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <Typography variant="h2" className="font-bold text-green-600">
                    {stats.itemsFound}
                  </Typography>
                  <Typography variant="body2" className="text-green-700 font-medium">
                    Items Found
                  </Typography>
                </Box>
              </Grid>

              {/* Claims Made Count */}
              <Grid item xs={12} sm={4}>
                <Box className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <Typography variant="h2" className="font-bold text-purple-600">
                    {stats.claimsMade}
                  </Typography>
                  <Typography variant="body2" className="text-purple-700 font-medium">
                    Claims Made
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            <TextField
              fullWidth
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
            />
            <TextField
              fullWidth
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdatePassword}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for messages */}
      <Snackbar
        open={!!successMessage || !!error}
        autoHideDuration={6000}
        onClose={() => {
          setSuccessMessage('');
          setError('');
        }}
      >
        <Alert
          severity={successMessage ? 'success' : 'error'}
          onClose={() => {
            setSuccessMessage('');
            setError('');
          }}
        >
          {successMessage || error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;