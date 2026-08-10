import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import {
  AddCircle,
  Search,
  TrendingUp,
  Inventory,
  CheckCircle,
  Pending,
  ArrowForward,
  Refresh
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ItemCard from '../components/ItemCard';
import StatsCard from '../components/StatsCard';
import EmptyState from '../components/EmptyState';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLost: 0,
    totalFound: 0,
    totalClaims: 0,
    pendingClaims: 0,
    matchedItems: 0
  });
  const [recentLost, setRecentLost] = useState([]);
  const [recentFound, setRecentFound] = useState([]);
  const [recentClaims, setRecentClaims] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [lostRes, foundRes, claimsRes] = await Promise.all([
        api.get('/lost-items/my-items'),
        api.get('/found-items/my-items'),
        api.get('/claims/my-claims')
      ]);

      const lostItems = lostRes.data.data || [];
      const foundItems = foundRes.data.data || [];
      const claims = claimsRes.data.data || [];

      setRecentLost(lostItems.slice(0, 5));
      setRecentFound(foundItems.slice(0, 5));
      setRecentClaims(claims.slice(0, 5));

      setStats({
        totalLost: lostItems.length,
        totalFound: foundItems.length,
        totalClaims: claims.length,
        pendingClaims: claims.filter(c => c.status === 'pending').length,
        matchedItems: 0 // This would come from a matches API call
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="lg" className="py-8">
      {/* Welcome Section */}
      <Paper className="p-6 mb-6 bg-gradient-primary text-white">
        <Box className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <Typography variant="h4" className="font-bold">
              Welcome back, {user?.name}!
            </Typography>
            <Typography variant="body1" className="opacity-90 mt-1">
              Here's what's happening with your items
            </Typography>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button
              variant="contained"
              color="secondary"
              component={Link}
              to="/report-lost"
              startIcon={<AddCircle />}
            >
              Report Lost
            </Button>
            <Button
              variant="outlined"
              className="text-white border-white hover:bg-white/10"
              component={Link}
              to="/report-found"
              startIcon={<AddCircle />}
            >
              Report Found
            </Button>
          </div>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Lost Items"
            value={stats.totalLost}
            icon={<Inventory className="text-blue-600" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Found Items"
            value={stats.totalFound}
            icon={<Search className="text-green-600" />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Claims"
            value={stats.totalClaims}
            icon={<TrendingUp className="text-purple-600" />}
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Pending Claims"
            value={stats.pendingClaims}
            icon={<Pending className="text-orange-600" />}
            color="#ed6c02"
          />
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Paper className="mb-6">
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Lost Items" />
          <Tab label="Found Items" />
          <Tab label="Claims" />
        </Tabs>

        <Box className="p-4">
          {/* Lost Items Tab */}
          {tabValue === 0 && (
            <div>
              <Box className="flex justify-between items-center mb-3">
                <Typography variant="h6">Your Lost Items</Typography>
                <Button
                  component={Link}
                  to="/report-lost"
                  size="small"
                  startIcon={<AddCircle />}
                >
                  Add New
                </Button>
              </Box>
              {recentLost.length === 0 ? (
                <EmptyState
                  type="add"
                  message="No lost items reported"
                  action={() => window.location.href = '/report-lost'}
                  actionLabel="Report Lost Item"
                />
              ) : (
                <Grid container spacing={2}>
                  {recentLost.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                      <ItemCard item={item} type="lost" />
                    </Grid>
                  ))}
                </Grid>
              )}
              {recentLost.length > 0 && (
                <Box className="text-center mt-4">
                  <Button
                    component={Link}
                    to="/my-items/lost"
                    endIcon={<ArrowForward />}
                  >
                    View All Lost Items
                  </Button>
                </Box>
              )}
            </div>
          )}

          {/* Found Items Tab */}
          {tabValue === 1 && (
            <div>
              <Box className="flex justify-between items-center mb-3">
                <Typography variant="h6">Your Found Items</Typography>
                <Button
                  component={Link}
                  to="/report-found"
                  size="small"
                  startIcon={<AddCircle />}
                >
                  Add New
                </Button>
              </Box>
              {recentFound.length === 0 ? (
                <EmptyState
                  type="add"
                  message="No found items reported"
                  action={() => window.location.href = '/report-found'}
                  actionLabel="Report Found Item"
                />
              ) : (
                <Grid container spacing={2}>
                  {recentFound.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                      <ItemCard item={item} type="found" />
                    </Grid>
                  ))}
                </Grid>
              )}
              {recentFound.length > 0 && (
                <Box className="text-center mt-4">
                  <Button
                    component={Link}
                    to="/my-items/found"
                    endIcon={<ArrowForward />}
                  >
                    View All Found Items
                  </Button>
                </Box>
              )}
            </div>
          )}

          {/* Claims Tab */}
          {tabValue === 2 && (
            <div>
              <Typography variant="h6" className="mb-3">Your Claims</Typography>
              {recentClaims.length === 0 ? (
                <EmptyState
                  type="inbox"
                  message="No claims yet"
                  action={() => window.location.href = '/search'}
                  actionLabel="Search Items"
                />
              ) : (
                <div className="space-y-3">
                  {recentClaims.map((claim) => (
                    <Card key={claim._id} className="hover:shadow-lg transition-shadow">
                      <CardContent>
                        <Box className="flex flex-col md:flex-row justify-between">
                          <div>
                            <Typography variant="subtitle1" className="font-bold">
                              {claim.lostItem?.title || claim.foundItem?.title || 'Item'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {claim.lostItem ? 'Lost Item' : 'Found Item'}
                            </Typography>
                            <Typography variant="body2" className="mt-1">
                              Status: <Chip
                                label={claim.status}
                                size="small"
                                color={
                                  claim.status === 'pending' ? 'warning' :
                                  claim.status === 'accepted' ? 'success' :
                                  claim.status === 'completed' ? 'info' : 'error'
                                }
                              />
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {new Date(claim.createdAt).toLocaleDateString()}
                            </Typography>
                          </div>
                          <div className="flex gap-2 mt-2 md:mt-0">
                            <Button
                              component={Link}
                              to={`/claims/${claim._id}`}
                              size="small"
                              variant="outlined"
                            >
                              View Details
                            </Button>
                            {claim.status === 'pending' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                              >
                                Respond
                              </Button>
                            )}
                          </div>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {recentClaims.length > 0 && (
                <Box className="text-center mt-4">
                  <Button
                    component={Link}
                    to="/claims"
                    endIcon={<ArrowForward />}
                  >
                    View All Claims
                  </Button>
                </Box>
              )}
            </div>
          )}
        </Box>
      </Paper>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper className="p-4">
            <Typography variant="h6" className="font-bold mb-3">
              Quick Actions
            </Typography>
            <div className="space-y-2">
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to="/search"
                startIcon={<Search />}
                className="justify-start"
              >
                Search for Items
              </Button>
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to="/matches"
                startIcon={<TrendingUp />}
                className="justify-start"
              >
                Find Matches
              </Button>
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to="/profile"
                startIcon={<Avatar sx={{ width: 20, height: 20 }} />}
                className="justify-start"
              >
                Update Profile
              </Button>
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className="p-4">
            <Typography variant="h6" className="font-bold mb-3">
              Tips & Guidelines
            </Typography>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="text-green-500 mt-0.5" fontSize="small" />
                Provide clear and detailed descriptions
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-green-500 mt-0.5" fontSize="small" />
                Upload high-quality images of your items
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-green-500 mt-0.5" fontSize="small" />
                Keep your contact information up to date
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-green-500 mt-0.5" fontSize="small" />
                Respond to claims and messages promptly
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-green-500 mt-0.5" fontSize="small" />
                Always verify item ownership before completing claims
              </li>
            </ul>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;