import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';

export const LocationPicker = ({ value, onChange, label }) => {
  const [address, setAddress] = useState(value?.address || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value?.address) {
      setAddress(value.address);
    }
  }, [value]);

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    onChange({
      address: newAddress,
      coordinates: value?.coordinates || { lat: null, lng: null }
    });
  };

  return (
    <Box className="w-full">
      <TextField
        fullWidth
        label={label || 'Location'}
        value={address}
        onChange={handleAddressChange}
        placeholder="Enter address or location"
        InputProps={{
          startAdornment: <LocationOn className="mr-2 text-gray-400" />,
          endAdornment: loading && <CircularProgress size={20} />
        }}
        helperText="Enter the location where the item was lost or found"
      />
      <Typography variant="caption" color="textSecondary" className="mt-1">
        Tip: Be as specific as possible (e.g., "Central Park, NYC")
      </Typography>
    </Box>
  );
};

export default LocationPicker;