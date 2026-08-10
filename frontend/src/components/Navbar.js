import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Container,
  Badge,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Search,
  Dashboard,
  Person,
  Logout,
  AdminPanelSettings,
  AddCircle,
  Notifications,
  Chat
} from '@mui/icons-material';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ Fetch unread count
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/chat/unread/count');
      setUnreadCount(response.data.data?.unread || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotifOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const navItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Search', path: '/search', icon: <Search /> },
  ];

  if (isAuthenticated) {
    navItems.push({ label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> });
  }

  return (
    <AppBar position="sticky" color="primary" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar className="justify-between px-0">
          <div className="flex items-center">
            <Typography
              variant="h6"
              component={Link}
              to="/"
              className="text-white no-underline font-bold"
            >
              Lost & Found
            </Typography>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                component={Link}
                to={item.path}
                startIcon={item.icon}
                className="text-white hover:bg-white/10"
                size="small"
              >
                {item.label}
              </Button>
            ))}

            {isAuthenticated && (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/report-lost"
                  startIcon={<AddCircle />}
                  className="text-white hover:bg-white/10"
                  size="small"
                >
                  Report
                </Button>
                
                <IconButton color="inherit" onClick={handleNotifOpen}>
                  <Badge badgeContent={3} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>

                <IconButton color="inherit" component={Link} to="/chat">
                  <Badge badgeContent={unreadCount} color="error">
                    <Chat />
                  </Badge>
                </IconButton>

                {isAdmin && (
                  <Button
                    color="inherit"
                    component={Link}
                    to="/admin"
                    startIcon={<AdminPanelSettings />}
                    className="text-white hover:bg-white/10"
                    size="small"
                  >
                    Admin
                  </Button>
                )}

                <IconButton onClick={handleMenu} color="inherit">
                  <Avatar
                    src={user?.avatar}
                    alt={user?.name}
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: { mt: 1, minWidth: 200 }
                  }}
                >
                  <MenuItem component={Link} to="/profile" onClick={handleClose}>
                    <Person className="mr-2" /> Profile
                  </MenuItem>
                  <MenuItem component={Link} to="/dashboard" onClick={handleClose}>
                    <Dashboard className="mr-2" /> Dashboard
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <Logout className="mr-2" /> Logout
                  </MenuItem>
                </Menu>

                <Menu
                  anchorEl={notifAnchorEl}
                  open={Boolean(notifAnchorEl)}
                  onClose={handleNotifClose}
                  PaperProps={{
                    sx: { mt: 1, minWidth: 300, maxHeight: 400 }
                  }}
                >
                  <MenuItem>
                    <Typography variant="subtitle2" className="font-bold">
                      Notifications
                    </Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleNotifClose}>
                    <div>
                      <Typography variant="body2">New claim request</Typography>
                      <Typography variant="caption" color="textSecondary">
                        2 hours ago
                      </Typography>
                    </div>
                  </MenuItem>
                  <MenuItem onClick={handleNotifClose}>
                    <div>
                      <Typography variant="body2">Match found for your item</Typography>
                      <Typography variant="caption" color="textSecondary">
                        5 hours ago
                      </Typography>
                    </div>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleNotifClose} className="justify-center">
                    <Typography variant="body2" color="primary">
                      View all notifications
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            )}

            {!isAuthenticated && (
              <>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  component={Link}
                  to="/register"
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <Box className="md:hidden py-4 bg-primary-dark">
            {navItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                component={Link}
                to={item.path}
                fullWidth
                className="text-white justify-start mb-1"
                startIcon={item.icon}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Button>
            ))}
            {isAuthenticated ? (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/report-lost"
                  fullWidth
                  className="text-white justify-start mb-1"
                  startIcon={<AddCircle />}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Report Lost
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/chat"
                  fullWidth
                  className="text-white justify-start mb-1"
                  startIcon={<Chat />}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Messages
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/profile"
                  fullWidth
                  className="text-white justify-start mb-1"
                  startIcon={<Person />}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Button>
                {isAdmin && (
                  <Button
                    color="inherit"
                    component={Link}
                    to="/admin"
                    fullWidth
                    className="text-white justify-start mb-1"
                    startIcon={<AdminPanelSettings />}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Button>
                )}
                <Divider className="bg-white/20 my-2" />
                <Button
                  color="inherit"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  fullWidth
                  className="text-white justify-start"
                  startIcon={<Logout />}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  fullWidth
                  className="text-white justify-start mb-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  component={Link}
                  to="/register"
                  fullWidth
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        )}
      </Container>
    </AppBar>
  );
};

export default Navbar;