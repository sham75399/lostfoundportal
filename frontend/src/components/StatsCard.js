import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatsCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent>
        <Box className="flex justify-between items-center">
          <Box>
            <Typography variant="subtitle2" color="textSecondary" className="uppercase font-bold">
              {title}
            </Typography>
            <Typography variant="h4" className="font-bold mt-1">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            className="p-3 rounded-full"
            sx={{ backgroundColor: color || '#1976d2' + '20' }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;