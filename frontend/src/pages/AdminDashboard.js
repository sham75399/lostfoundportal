import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  People,
  Inventory,
  TrendingUp,
  Pending,
  CheckCircle,
  Cancel,
  Delete,
  Edit,
  Visibility
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatsCard from '../components/StatsCard';
import Chart from '../components/Chart';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogType, setDialogType] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, itemsRes, claimsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=10'),
        api.get('/admin/items?limit=10'),
        api.get('/admin/claims?limit=10')
      ]);

      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setItems(itemsRes.data.data);
      setClaims(claimsRes.data.data);
    } catch (error) {
      setError('Failed to fetch dashboard data');
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleApproveItem = async (id, type) => {
    try {
      await api.put(`/admin/items/${id}/approve`, { type });
      setSuccessMessage('Item approved successfully!');
      fetchDashboardData();
    } catch (error) {
      setError('Failed to approve item');
    }
  };

  const handleDeleteItem = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/admin/items/${id}`, { data: { type } });
        setSuccessMessage('Item deleted successfully!');
        fetchDashboardData();
      } catch (error) {
        setError('Failed to delete item');
      }
    }
  };

  const handleUpdateClaim = async (id, status) => {
    try {
      await api.put(`/admin/claims/${id}`, { status });
      setSuccessMessage('Claim updated successfully!');
      fetchDashboardData();
    } catch (error) {
      setError('Failed to update claim');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        setSuccessMessage('User deleted successfully!');
        fetchDashboardData();
      } catch (error) {
        setError('Failed to delete user');
      }
    }
  };

  const handleUpdateUserRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setSuccessMessage('User role updated successfully!');
      fetchDashboardData();
    } catch (error) {
      setError('Failed to update user role');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="xl" className="py-8">
      <Typography variant="h4" className="font-bold mb-6">
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Users"
            value={stats.users || 0}
            icon={<People className="text-blue-600" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Lost Items"
            value={stats.lostItems || 0}
            icon={<Inventory className="text-red-600" />}
            color="#dc004e"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Found Items"
            value={stats.foundItems || 0}
            icon={<Inventory className="text-green-600" />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Pending Claims"
            value={stats.pendingClaims || 0}
            icon={<Pending className="text-orange-600" />}
            color="#ed6c02"
          />
        </Grid>
      </Grid>

      {/* Chart */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={8}>
          <Paper className="p-4">
            <Chart
              type="bar"
              data={stats.monthlyData || []}
              title="Monthly Activity"
              xAxisKey="month"
              yAxisKey="count"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className="p-4">
            <Chart
              type="pie"
              data={[
                { name: 'Lost', value: stats.lostItems || 0 },
                { name: 'Found', value: stats.foundItems || 0 }
              ]}
              title="Item Distribution"
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Items" />
          <Tab label="Claims" />
          <Tab label="Users" />
        </Tabs>

        {/* Items Tab */}
        {tabValue === 0 && (
          <Box className="p-4">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Approved</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.type || 'Unknown'}
                          size="small"
                          color={item.type === 'lost' ? 'error' : 'success'}
                        />
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status}
                          size="small"
                          color={item.status === 'open' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.isApproved ? 'Yes' : 'No'}
                          size="small"
                          color={item.isApproved ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        {!item.isApproved && (
                          <IconButton
                            color="success"
                            onClick={() => handleApproveItem(item._id, item.type)}
                            size="small"
                          >
                            <CheckCircle />
                          </IconButton>
                        )}
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteItem(item._id, item.type)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => window.location.href = `/item/${item._id}`}
                          size="small"
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Claims Tab */}
        {tabValue === 1 && (
          <Box className="p-4">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Claimant</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {claims.map((claim) => (
                    <TableRow key={claim._id}>
                      <TableCell>
                        {claim.lostItem?.title || claim.foundItem?.title || 'Unknown'}
                      </TableCell>
                      <TableCell>{claim.claimant?.name}</TableCell>
                      <TableCell>{claim.owner?.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={claim.status}
                          size="small"
                          color={
                            claim.status === 'pending' ? 'warning' :
                            claim.status === 'accepted' ? 'success' :
                            claim.status === 'completed' ? 'info' : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {claim.status === 'pending' && (
                          <>
                            <IconButton
                              color="success"
                              onClick={() => handleUpdateClaim(claim._id, 'accepted')}
                              size="small"
                            >
                              <CheckCircle />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleUpdateClaim(claim._id, 'rejected')}
                              size="small"
                            >
                              <Cancel />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          color="primary"
                          onClick={() => window.location.href = `/claims/${claim._id}`}
                          size="small"
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Users Tab */}
        {tabValue === 2 && (
          <Box className="p-4">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.name}
                          {user.role === 'admin' && (
                            <Chip label="Admin" size="small" color="primary" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={user.role === 'admin' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.role !== 'admin' && (
                          <>
                            <IconButton
                              color="primary"
                              onClick={() => handleUpdateUserRole(user._id, 'admin')}
                              size="small"
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteUser(user._id)}
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Snackbar */}
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

export default AdminDashboard;