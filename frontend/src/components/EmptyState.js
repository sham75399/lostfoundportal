import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Search, AddCircle, Inbox, Error } from '@mui/icons-material';

const EmptyState = ({ type, message, action, actionLabel, icon }) => {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <Search className="text-6xl text-gray-400" />;
      case 'add':
        return <AddCircle className="text-6xl text-gray-400" />;
      case 'error':
        return <Error className="text-6xl text-gray-400" />;
      case 'inbox':
      default:
        return <Inbox className="text-6xl text-gray-400" />;
    }
  };

  return (
    <Box className="flex flex-col items-center justify-center p-12 text-center">
      {icon || getIcon()}
      <Typography variant="h6" className="mt-4 font-bold">
        {message || 'Nothing to see here'}
      </Typography>
      <Typography variant="body2" color="textSecondary" className="mt-2 max-w-md">
        {action ? 'Get started by taking action below' : 'Check back later for updates'}
      </Typography>
      {action && (
        <Button
          variant="contained"
          color="primary"
          className="mt-4"
          onClick={action}
          startIcon={type === 'add' ? <AddCircle /> : <Search />}
        >
          {actionLabel || 'Take Action'}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;