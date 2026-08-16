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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  CircularProgress
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
  Chat,
  CheckCircle,
  Cancel,
  Message,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import api from '../utils/api';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // ✅ Fetch unread count
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      fetchNotifications();
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

  // ✅ Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const response = await api.get('/notifications');
      setNotifications(response.data.data || []);
      const unread = response.data.data?.filter(n => !n.isRead).length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifs(false);
    }
  };

  // ✅ Mark notification as read
  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // ✅ Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
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
    // Refresh notifications when opening
    fetchNotifications();
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'claim':
        return <CheckCircle color="primary" />;
      case 'match':
        return <Chat color="success" />;
      case 'message':
        return <Message color="info" />;
      case 'admin':
        return <AdminIcon color="warning" />;
      default:
        return <Notifications />;
    }
  };

  const getTimeAgo = (date) => {
    const diff = new Date() - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
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
                
                {/* ✅ Bell Icon with dynamic badge */}
                <IconButton color="inherit" onClick={handleNotifOpen}>
                  <Badge badgeContent={unreadCount} color="error">
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

                {/* ✅ Notification Dropdown */}
                <Menu
                  anchorEl={notifAnchorEl}
                  open={Boolean(notifAnchorEl)}
                  onClose={handleNotifClose}
                  PaperProps={{
                    sx: { 
                      mt: 1, 
                      width: 380, 
                      maxHeight: 500,
                      overflow: 'auto'
                    }
                  }}
                >
                  <Box className="flex justify-between items-center p-3 border-b">
                    <Typography variant="h6" className="font-bold">
                      Notifications
                    </Typography>
                    {unreadCount > 0 && (
                      <Button size="small" onClick={markAllAsRead}>
                        Mark all as read
                      </Button>
                    )}
                  </Box>

                  {loadingNotifs ? (
                    <Box className="p-8 text-center">
                      <CircularProgress size={30} />
                    </Box>
                  ) : notifications.length === 0 ? (
                    <Box className="p-8 text-center">
                      <Typography variant="body2" color="textSecondary">
                        No notifications yet
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {notifications.slice(0, 10).map((notification) => (
                        <MenuItem
                          key={notification._id}
                          onClick={() => {
                            markAsRead(notification._id);
                            if (notification.link) {
                              console.log('🔗 Navigating to:', notification.link);
                              navigate(notification.link);
                            }
                            handleNotifClose();
                          }}
                          className={`${!notification.isRead ? 'bg-blue-50' : ''}`}
                        >
                          <ListItemIcon>
                            {getNotificationIcon(notification.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2" className="font-medium">
                                {notification.title}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography variant="caption" display="block" color="textSecondary">
                                  {notification.message}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {getTimeAgo(notification.createdAt)}
                                </Typography>
                              </>
                            }
                          />
                        </MenuItem>
                      ))}
                      {notifications.length > 10 && (
                        <Divider />
                      )}
                      {notifications.length > 10 && (
                        <Box className="p-2 text-center">
                          <Button size="small" fullWidth>
                            View All Notifications
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
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
                  {unreadCount > 0 && (
                    <Badge badgeContent={unreadCount} color="error" className="ml-2" />
                  )}
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