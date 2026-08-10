import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  Divider,
  Avatar,
  Grid
} from '@mui/material';
import { Person, CalendarToday, Message, CheckCircle, Cancel, Pending } from '@mui/icons-material';

const ClaimCard = ({ claim, onAccept, onReject, onView }) => {
  const {
    _id,
    claimant,
    owner,
    lostItem,
    foundItem,
    status,
    message,
    createdAt,
    proof
  } = claim;

  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending': return <Pending />;
      case 'accepted': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      case 'completed': return <CheckCircle />;
      default: return null;
    }
  };

  const itemName = lostItem?.title || foundItem?.title || 'Unknown Item';
  const itemType = lostItem ? 'Lost' : 'Found';

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <div className="flex items-start justify-between">
              <div>
                <Typography variant="h6" className="font-bold">
                  {itemName}
                </Typography>
                <Typography variant="body2" color="textSecondary" className="mb-2">
                  {itemType} Item Claim
                </Typography>
              </div>
              <Chip
                label={status.toUpperCase()}
                color={getStatusColor()}
                icon={getStatusIcon()}
                size="small"
              />
            </div>

            <Divider className="my-2" />

            <div className="flex items-center gap-2 mb-2">
              <Avatar src={claimant?.avatar} sx={{ width: 24, height: 24 }} />
              <Typography variant="body2">
                <strong>Claimant:</strong> {claimant?.name}
              </Typography>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Person fontSize="small" className="text-gray-500" />
              <Typography variant="body2">
                <strong>Owner:</strong> {owner?.name}
              </Typography>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <CalendarToday fontSize="small" className="text-gray-500" />
              <Typography variant="body2">
                {new Date(createdAt).toLocaleString()}
              </Typography>
            </div>

            {message && (
              <Box className="bg-gray-50 p-3 rounded-lg mt-2">
                <Typography variant="body2" className="flex items-start gap-2">
                  <Message fontSize="small" className="text-gray-500 mt-0.5" />
                  <span>{message}</span>
                </Typography>
              </Box>
            )}

            {proof && proof.length > 0 && (
              <Box className="mt-2">
                <Typography variant="caption" color="textSecondary">
                  {proof.length} proof document(s) uploaded
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={4} className="flex flex-col gap-2">
            {status === 'pending' && (
              <>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={() => onAccept(_id)}
                  startIcon={<CheckCircle />}
                >
                  Accept Claim
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={() => onReject(_id)}
                  startIcon={<Cancel />}
                >
                  Reject Claim
                </Button>
              </>
            )}
            <Button
              fullWidth
              variant="outlined"
              onClick={() => onView(_id)}
            >
              View Details
            </Button>
            {status !== 'pending' && (
              <Chip
                label={`Status: ${status}`}
                color={getStatusColor()}
                size="small"
                className="mt-1"
              />
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ClaimCard;