import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Pending,
  Visibility
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';

const Claims = () => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false); // ✅ ADD THIS STATE

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const response = await api.get('/claims');
      setClaims(response.data.data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
      setError('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADD THIS FUNCTION - handleUpdateClaim
  const handleUpdateClaim = async (claimId, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this claim?`)) {
      return;
    }

    setUpdating(true);
    try {
      await api.put(`/claims/${claimId}`, { status });
      // Refresh claims list
      await fetchClaims();
    } catch (error) {
      console.error('Error updating claim:', error);
      setError('Failed to update claim status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Pending />;
      case 'accepted': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'completed': return <CheckCircle />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" className="py-16">
        <Box className="flex justify-center items-center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="py-8">
      <Typography variant="h4" className="font-bold mb-6">
        My Claims
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {claims.length === 0 ? (
        <Paper className="p-8 text-center">
          <Typography variant="h6" color="textSecondary">
            No claims yet
          </Typography>
          <Typography variant="body2" color="textSecondary" className="mt-2">
            You haven't made any claims or received any claims yet.
          </Typography>
          <Button
            variant="contained"
            className="mt-4"
            component={Link}
            to="/search"
          >
            Browse Items
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {claims.map((claim) => (
            <Grid item xs={12} key={claim._id}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent>
                  <Box className="flex flex-col md:flex-row justify-between">
                    <div className="flex-1">
                      <Typography variant="h6" className="font-bold">
                        {claim.lostItem?.title || claim.foundItem?.title || 'Item Claim'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {claim.lostItem ? 'Lost Item' : 'Found Item'}
                      </Typography>
                      <div className="flex items-center gap-2 mt-2">
                        <Chip
                          label={claim.status.toUpperCase()}
                          color={getStatusColor(claim.status)}
                          icon={getStatusIcon(claim.status)}
                          size="small"
                        />
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(claim.createdAt)}
                        </Typography>
                      </div>
                      {claim.message && (
                        <Typography variant="body2" className="mt-2 text-gray-600">
                          <strong>Message:</strong> {claim.message}
                        </Typography>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 mt-4 md:mt-0">
                      <Button
                        variant="outlined"
                        size="small"
                        component={Link}
                        to={`/claims/${claim._id}`}
                        startIcon={<Visibility />}
                      >
                        View Details
                      </Button>
                      {claim.status === 'pending' && claim.owner?._id === user?.id && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => handleUpdateClaim(claim._id, 'accepted')}
                            disabled={updating}
                            startIcon={<CheckCircle />}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleUpdateClaim(claim._id, 'rejected')}
                            disabled={updating}
                            startIcon={<Cancel />}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Claims;