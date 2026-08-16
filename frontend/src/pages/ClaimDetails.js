import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Snackbar
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Pending,
  Person,
  Email,
  Phone,
  CalendarToday,
  ArrowBack
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';

const ClaimDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchClaimDetails();
  }, [id]);

  const fetchClaimDetails = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('📝 Fetching claim:', id);
      const response = await api.get(`/claims/${id}`);
      console.log('✅ Claim fetched:', response.data);
      setClaim(response.data.data);
    } catch (error) {
      console.error('❌ Error fetching claim:', error);
      if (error.response?.status === 403) {
        setError('You are not authorized to view this claim');
      } else if (error.response?.status === 404) {
        setError('Claim not found');
      } else {
        setError(error.response?.data?.message || 'Failed to load claim details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!window.confirm(`Are you sure you want to ${status} this claim?`)) {
      return;
    }

    setUpdating(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('📤 Updating claim status to:', status);
      const response = await api.put(`/claims/${id}`, { status });
      console.log('✅ Claim updated:', response.data);
      
      setSuccessMessage(`Claim ${status} successfully!`);
      
      // Refresh claim details
      await fetchClaimDetails();
    } catch (error) {
      console.error('❌ Error updating claim:', error);
      console.error('Response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to update claim status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" className="py-16">
        <Box className="flex justify-center items-center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !claim) {
    return (
      <Container maxWidth="md" className="py-16">
        <Alert severity="error" className="mb-4">
          {error || 'Claim not found'}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/claims')}
        >
          Back to Claims
        </Button>
      </Container>
    );
  }

  const isOwner = claim.owner?._id === user?.id;
  const isClaimant = claim.claimant?._id === user?.id;

  return (
    <Container maxWidth="md" className="py-8">
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/claims')}
        className="mb-4"
      >
        Back to Claims
      </Button>

      <Paper className="p-6">
        <Box className="flex justify-between items-start mb-4">
          <Typography variant="h5" className="font-bold">
            Claim Details
          </Typography>
          <Chip
            label={claim.status.toUpperCase()}
            color={
              claim.status === 'pending' ? 'warning' :
              claim.status === 'accepted' ? 'success' :
              claim.status === 'rejected' ? 'error' : 'info'
            }
            size="medium"
          />
        </Box>

        {successMessage && (
          <Alert severity="success" className="mb-4">
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <Divider className="mb-4" />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Item
                </Typography>
                <Typography variant="h6">
                  {claim.lostItem?.title || claim.foundItem?.title || 'Unknown Item'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {claim.lostItem ? 'Lost Item' : 'Found Item'}
                </Typography>
                {claim.lostItem?.category && (
                  <Chip label={claim.lostItem.category} size="small" className="mt-2" />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Claimant
                </Typography>
                <Typography variant="h6">{claim.claimant?.name}</Typography>
                <Typography variant="body2">
                  <Email fontSize="small" className="mr-1" />
                  {claim.claimant?.email}
                </Typography>
                {claim.claimant?.phone && (
                  <Typography variant="body2">
                    <Phone fontSize="small" className="mr-1" />
                    {claim.claimant?.phone}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Message
                </Typography>
                <Typography variant="body1">
                  {claim.message || 'No message provided'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary">
                  Timeline
                </Typography>
                <Typography variant="body2">
                  <CalendarToday fontSize="small" className="mr-1" />
                  Submitted: {formatDate(claim.createdAt)}
                </Typography>
                {claim.updatedAt && (
                  <Typography variant="body2" className="mt-1">
                    Last updated: {formatDate(claim.updatedAt)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {claim.status === 'pending' && isOwner && (
            <Grid item xs={12}>
              <Box className="flex gap-4 mt-4">
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<CheckCircle />}
                  onClick={() => handleUpdateStatus('accepted')}
                  disabled={updating}
                  className="flex-1"
                >
                  {updating ? 'Updating...' : 'Accept Claim'}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  startIcon={<Cancel />}
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={updating}
                  className="flex-1"
                >
                  {updating ? 'Updating...' : 'Reject Claim'}
                </Button>
              </Box>
            </Grid>
          )}

          {claim.status === 'pending' && !isOwner && isClaimant && (
            <Grid item xs={12}>
              <Alert severity="info">
                Your claim is pending review by the item owner.
              </Alert>
            </Grid>
          )}

          {claim.status === 'accepted' && (
            <Grid item xs={12}>
              <Alert severity="success">
                ✅ This claim has been accepted! Contact the owner to arrange the return.
              </Alert>
              <Button
                variant="contained"
                startIcon={<Person />}
                component={Link}
                to={`/chat/${claim.owner?._id}`}
                className="mt-4"
              >
                Message Owner
              </Button>
            </Grid>
          )}

          {claim.status === 'rejected' && (
            <Grid item xs={12}>
              <Alert severity="error">
                ❌ This claim has been rejected.
              </Alert>
            </Grid>
          )}

          {claim.status === 'completed' && (
            <Grid item xs={12}>
              <Alert severity="success">
                ✅ This claim has been completed. Item successfully returned!
              </Alert>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default ClaimDetails;