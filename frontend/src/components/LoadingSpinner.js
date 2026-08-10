import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...', fullPage = true }) => {
  const content = (
    <Box className="flex flex-col items-center justify-center">
      <CircularProgress size={48} className="mb-4" color="primary" />
      {message && (
        <Typography variant="body2" color="textSecondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullPage) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        {content}
      </Box>
    );
  }

  return content;
};

export default LoadingSpinner;