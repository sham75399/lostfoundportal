import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Box,
  Button,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  CheckCircle,
  Cancel,
  Message,
  AdminPanelSettings
} from '@mui/icons-material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data);
      setUnreadCount(response.data.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    markAllAsRead();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'claim':
        return <CheckCircle color="primary" />;
      case 'match':
        return <NotificationsActive color="success" />;
      case 'message':
        return <Message color="info" />;
      case 'admin':
        return <AdminPanelSettings color="warning" />;
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

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <Notifications />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            mt: 1.5
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

        {notifications.length === 0 ? (
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
                    window.location.href = notification.link;
                  }
                  handleClose();
                }}
                className={`${!notification.isRead ? 'bg-blue-50' : ''}`}
              >
                <ListItemIcon>
                  {getIcon(notification.type)}
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
            <Box className="p-2 text-center">
              <Button size="small" fullWidth>
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;